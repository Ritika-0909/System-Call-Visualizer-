import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
} from 'recharts';

const COLORS = ['#2563eb', '#f97316', '#16a34a', '#9333ea', '#0ea5e9', '#facc15', '#ef4444', '#14b8a6'];

export const SyscallTimeline = ({ events, activeFilter = 'all', onSelect }) => {
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all' || !activeFilter) return events;
    return events.filter((event) => event.name === activeFilter);
  }, [events, activeFilter]);

  const grouped = useMemo(() => {
    const names = Array.from(new Set(filteredEvents.map((event) => event.name)));
    return names.map((name, idx) => ({
      name,
      color: COLORS[idx % COLORS.length],
      data: filteredEvents
        .filter((event) => event.name === name)
        .map((event) => ({
          x: event.timestamp ?? event.index,
          y: event.index,
          ...event,
        })),
    }));
  }, [filteredEvents]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Syscall Timeline</h3>
          <p className="text-sm text-muted-foreground">Chronological trace of every captured system call.</p>
        </div>
        <Badge variant="secondary">{filteredEvents.length} events</Badge>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="x"
              name="Timestamp"
              unit="s"
              tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(6) : value)}
            />
            <YAxis type="number" dataKey="y" name="Sequence" allowDecimals={false} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, _name, payload) => {
                if (payload?.payload?.raw) {
                  return [payload.payload.raw, 'trace'];
                }
                return [value, ''];
              }}
            />
            <Legend />
            {grouped.map((dataset) => (
              <Scatter
                key={dataset.name}
                name={`${dataset.name}()`}
                data={dataset.data}
                fill={dataset.color}
                onClick={(payload) => {
                  if (!payload?.payload) return;
                  onSelect?.(payload.payload);
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <button
              key={event.index}
              onClick={() => onSelect?.(event)}
              className="w-full text-left p-3 rounded-md border border-border hover:border-primary transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    #{event.index}
                  </Badge>
                  <span className="font-mono font-semibold">{event.name}()</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {event.timestamp !== null ? `${event.timestamp.toFixed(6)}s` : `order ${event.index}`}
                </span>
              </div>
              {event.result && (
                <p className="text-xs font-mono text-muted-foreground mt-1">↳ result: {event.result}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{event.raw}</p>
            </button>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">No events match the current filter.</div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

