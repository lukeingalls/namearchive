import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NameTrendChartProps {
  data: { year: number; count: number; percentage: number }[];
  name: string;
}

export function NameTrendChart({ data, name }: NameTrendChartProps) {
  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4b896" opacity={0.3} />
          <XAxis 
            dataKey="year" 
            stroke="#8b7355"
            tick={{ fill: '#8b7355' }}
            domain={[1900, 2026]}
          />
          <YAxis 
            stroke="#8b7355"
            tick={{ fill: '#8b7355' }}
            domain={[0, 100]}
            label={{ value: 'Relative Popularity (%)', angle: -90, position: 'insideLeft', fill: '#8b7355' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#f5f1e8', 
              border: '1px solid #d4b896',
              borderRadius: '4px',
              padding: '12px'
            }}
            labelStyle={{ color: '#4a3f2f', fontWeight: 600 }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Popularity']}
          />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#8b6914" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#8b6914' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
