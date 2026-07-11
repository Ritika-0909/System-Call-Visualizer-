import { Card } from '@/components/ui/card';
import { getCategoryColor, getCategoryIcon } from '@/utils/syscallParser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export const SyscallAnalytics = ({ syscalls }) => {
  // Prepare data for bar chart
  const barData = syscalls.slice(0, 10).map(s => ({
    name: s.name,
    count: s.count,
    category: s.category,
  }));

  // Prepare data for category distribution
  const categoryMap = new Map();
  syscalls.forEach(s => {
    categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + s.count);
  });

  const pieData = Array.from(categoryMap.entries()).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  const COLORS = {
    file: 'hsl(217, 91%, 60%)',
    process: 'hsl(25, 95%, 53%)',
    memory: 'hsl(142, 76%, 36%)',
    network: 'hsl(262, 83%, 58%)',
    other: 'hsl(220, 10%, 50%)',
  };

  const totalCalls = syscalls.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {syscalls.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          No system calls available for analytics. Run an analysis or adjust filters.
        </Card>
      )}
      {syscalls.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Syscalls</p>
            <p className="text-4xl font-bold text-primary">{totalCalls}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Unique Syscalls</p>
            <p className="text-4xl font-bold text-kernelMode">{syscalls.length}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Categories</p>
            <p className="text-4xl font-bold text-dataTransfer">{categoryMap.size}</p>
          </div>
        </Card>
      </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Call Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top System Calls</h3>
          <div className="space-y-3">
            {syscalls.slice(0, 5).map((syscall, i) => (
              <div key={syscall.name} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{i + 1}</span>
                  <span className="text-xl">{getCategoryIcon(syscall.category)}</span>
                  <span className="font-mono font-semibold">{syscall.name}()</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{syscall.count}</p>
                  <p className="text-xs text-muted-foreground">calls</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

