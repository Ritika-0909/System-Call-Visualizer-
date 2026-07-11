import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import re
import uuid
import shutil
import glob
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Get timeout from environment variable (default 5 seconds)
TIMEOUT = int(os.environ.get("SYSCALL_VISTA_TIMEOUT", "5"))


def parse_timestamp(ts_str):
    """Parse timestamp - either decimal seconds or HH:MM:SS.microseconds format"""
    # Try HH:MM:SS.microseconds format (from -tt flag)
    time_match = re.match(r'(\d+):(\d+):(\d+\.\d+)', ts_str)
    if time_match:
        hours = int(time_match.group(1))
        minutes = int(time_match.group(2))
        seconds = float(time_match.group(3))
        # Convert to seconds since start of day (or just use as relative timestamp)
        total_seconds = hours * 3600 + minutes * 60 + seconds
        return total_seconds
    # Try simple decimal format
    try:
        return float(ts_str)
    except:
        return None


def parse_strace_line(line):
    """
    Parse a single strace line with format:
    timestamp syscall_name(args) = result <duration>
    or with -tt: 15:27:57.538640 write(1, "Hello", 27) = 27 <0.000053>
    or: [pid 12345] 170.123456 write(1, "Hello", 27) = 27 <0.000053>
    or: 12345  170.123456 write(1, "Hello", 27) = 27 <0.000053>
    """
    line = line.strip()
    if not line or line.startswith('+++') or line.startswith('---'):
        return None
    
    pid = None
    timestamp = None
    syscall_name = None
    result = None
    duration = None
    
    # Try pattern with [pid ...] prefix and timestamp (HH:MM:SS.microseconds or decimal)
    pattern1 = r'\[pid\s+(\d+)\]\s+([\d:\.]+)\s+(\w+)\s*\([^)]*\)\s*=\s*([^<\n?]+?)(?:\s*<([^>]+)>)?'
    match = re.match(pattern1, line)
    if match:
        pid = int(match.group(1))
        timestamp = parse_timestamp(match.group(2))
        syscall_name = match.group(3)
        result = match.group(4).strip() if match.group(4) else None
        duration = float(match.group(5)) if match.group(5) else None
    else:
        # Try pattern: pid  timestamp syscall(...) = result <duration>
        pattern2 = r'^(\d+)\s+([\d:\.]+)\s+(\w+)\s*\([^)]*\)\s*=\s*([^<\n?]+?)(?:\s*<([^>]+)>)?'
        match = re.match(pattern2, line)
        if match:
            pid = int(match.group(1))
            timestamp = parse_timestamp(match.group(2))
            syscall_name = match.group(3)
            result = match.group(4).strip() if match.group(4) else None
            duration = float(match.group(5)) if match.group(5) else None
        else:
            # Try pattern without pid: timestamp syscall(...) = result <duration>
            # This is the most common format with -ff flag
            pattern3 = r'^([\d:\.]+)\s+(\w+)\s*\([^)]*\)\s*=\s*([^<\n?]+?)(?:\s*<([^>]+)>)?'
            match = re.match(pattern3, line)
            if match:
                timestamp = parse_timestamp(match.group(1))
                syscall_name = match.group(2)
                result = match.group(3).strip() if match.group(3) else None
                duration = float(match.group(4)) if match.group(4) else None
            else:
                # Try pattern with ? result (like exit_group)
                pattern4 = r'^([\d:\.]+)\s+(\w+)\s*\([^)]*\)\s*=\s*\?\s*(?:<([^>]+)>)?'
                match = re.match(pattern4, line)
                if match:
                    timestamp = parse_timestamp(match.group(1))
                    syscall_name = match.group(2)
                    result = '?'
                    duration = float(match.group(3)) if match.group(3) else None
                else:
                    return None
    
    if not syscall_name or timestamp is None:
        return None
    
    return {
        'pid': pid,
        'timestamp': timestamp,
        'name': syscall_name,
        'result': result,
        'duration': duration,
        'raw': line
    }


def parse_strace_output(trace_content):
    """Parse strace output and extract syscall events."""
    events = []
    lines = trace_content.split('\n')
    
    for line in lines:
        parsed = parse_strace_line(line)
        if parsed:
            events.append({
                'index': len(events),
                'name': parsed['name'],
                'timestamp': parsed['timestamp'],
                'duration': parsed['duration'],
                'pid': parsed['pid'],
                'result': parsed['result'],
                'raw': parsed['raw']
            })
    
    return events


@app.route("/analyze", methods=["POST"])
def analyze():
    temp_dir = None
    try:
        # Try reading JSON first
        data = None
        try:
            data = request.get_json()
        except:
            pass

        # If JSON contains codeSnippet
        if data and "codeSnippet" in data:
            code = data["codeSnippet"]
        else:
            # Try reading form-data: request.form
            code = request.form.get("codeSnippet") or request.form.get("code")

        # Try reading raw text body
        if not code:
            code = request.data.decode("utf-8")

        if not code:
            return jsonify({"error": "No code provided"}), 400

        # Create a temporary directory for this analysis
        temp_dir = tempfile.mkdtemp(prefix="syscall_vista_")
        temp_path = os.path.join(temp_dir, "code.c")
        output_binary = os.path.join(temp_dir, "code.out")
        strace_output = os.path.join(temp_dir, "trace.txt")

        # Save code to temp file
        with open(temp_path, "w") as f:
            f.write(code)

        # Compile the C file
        compile_process = subprocess.run(
            ["gcc", "-O0", temp_path, "-o", output_binary],
            capture_output=True,
            text=True,
            timeout=TIMEOUT
        )

        if compile_process.returncode != 0:
            return jsonify({
                "error": "Compilation failed",
                "details": compile_process.stderr
            }), 400

        # Make binary executable
        os.chmod(output_binary, 0o755)

        # Run the program first to capture stdout/stderr
        run_process = subprocess.run(
            [output_binary],
            capture_output=True,
            text=True,
            timeout=TIMEOUT
        )
        stdout_content = run_process.stdout
        stderr_content = run_process.stderr

        # Run strace with timing and follow forks
        # -ff: follow forks, create separate trace files for each process
        # -tt: print timestamps with microsecond precision
        # -T: print time spent in each syscall
        try:
            strace_process = subprocess.run(
                ["strace", "-ff", "-tt", "-T", "-o", strace_output, output_binary],
                capture_output=True,
                text=True,
                timeout=TIMEOUT
            )
            
            # Note: strace returns the traced program's exit code, not its own
            # So returncode != 0 doesn't necessarily mean strace failed
            print(f"DEBUG: strace completed with returncode {strace_process.returncode}")
            if strace_process.stderr:
                print(f"DEBUG: strace stderr (first 500 chars): {strace_process.stderr[:500]}")
        except FileNotFoundError:
            return jsonify({
                "error": "strace command not found. Please install strace: sudo apt install strace"
            }), 500
        except subprocess.TimeoutExpired:
            return jsonify({
                "error": f"strace execution timed out after {TIMEOUT} seconds"
            }), 408
        except Exception as e:
            print(f"DEBUG: Exception running strace: {e}")
            traceback.print_exc()
            return jsonify({
                "error": f"Error running strace: {str(e)}"
            }), 500

        # Read trace file(s) - strace -ff creates files named trace.txt.<pid> for each process
        trace_content = ""
        trace_files = []
        
        # Find all trace files matching trace.txt or trace.txt.<pid> pattern
        base_dir = os.path.dirname(strace_output)
        base_name = os.path.basename(strace_output)
        
        # Check for main trace file (might exist without -ff or with older strace)
        if os.path.exists(strace_output):
            trace_files.append(strace_output)
        
        # Find all trace files with .<pid> suffix (strace -ff creates these)
        pattern = f"{strace_output}.*"
        pid_files = glob.glob(pattern)
        trace_files.extend(pid_files)
        
        # Also check in the directory for any matching files
        dir_pattern = os.path.join(base_dir, f"{base_name}.*")
        additional_files = glob.glob(dir_pattern)
        for f in additional_files:
            if f not in trace_files:
                trace_files.append(f)
        
        # Debug: Check if trace files exist
        print(f"DEBUG: Looking for trace files in {temp_dir}")
        print(f"DEBUG: Main trace file exists: {os.path.exists(strace_output)}")
        for tf in trace_files:
            exists = os.path.exists(tf)
            print(f"DEBUG: Trace file {tf} exists: {exists}")
            if exists:
                size = os.path.getsize(tf)
                print(f"DEBUG: Trace file {tf} size: {size} bytes")
        
        # Combine all trace files
        for trace_file in trace_files:
            if os.path.exists(trace_file):
                try:
                    with open(trace_file, "r") as f:
                        content = f.read()
                        if content:
                            trace_content += content + "\n"
                            print(f"DEBUG: Read {len(content)} bytes from {trace_file}")
                except Exception as e:
                    print(f"Warning: Could not read trace file {trace_file}: {e}")
        
        if not trace_content:
            # Try to get more debug info
            debug_info = {
                "strace_returncode": strace_process.returncode,
                "strace_stdout": strace_process.stdout[:500] if strace_process.stdout else None,
                "strace_stderr": strace_process.stderr[:500] if strace_process.stderr else None,
                "trace_file_exists": os.path.exists(strace_output),
                "temp_dir": temp_dir,
            }
            print(f"DEBUG: No trace content. Debug info: {debug_info}")
            return jsonify({
                "error": "No strace output generated. The program may have failed to execute.",
                "details": strace_process.stderr[:500] if strace_process.stderr else "No error details available",
                "debug": debug_info
            }), 500

        # Parse the strace output
        events = parse_strace_output(trace_content)
        
        # Debug: log if no events found
        if not events and trace_content:
            # Log first few lines of trace for debugging
            lines = trace_content.split('\n')[:10]
            print(f"DEBUG: No events parsed. First 10 lines of trace:")
            for i, line in enumerate(lines):
                print(f"  {i}: {line[:100]}")
        
        # Build summary (count of each syscall)
        summary = defaultdict(int)
        sequence = []
        
        for event in events:
            if event and 'name' in event:
                summary[event['name']] += 1
                sequence.append(event['name'])

        # Generate unique ID
        analysis_id = str(uuid.uuid4()).replace("-", "")

        # Build response
        result = {
            "id": analysis_id,
            "summary": dict(summary),
            "sequence": sequence,
            "events": events,
            "stdout": stdout_content,
            "stderr": stderr_content,
            "source": code
        }

        return jsonify(result)

    except subprocess.TimeoutExpired:
        return jsonify({"error": f"Analysis timed out after {TIMEOUT} seconds"}), 408
    except Exception as e:
        print("ERROR OCCURRED:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temporary directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except:
                pass


@app.route("/")
def home():
    return "Backend running!"


if __name__ == "__main__":
    app.run(port=5000, debug=True)
