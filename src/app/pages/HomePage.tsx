import { Link } from 'react-router';
import { availableNames, babyNamesDatabase } from '../data/babyNamesData';
import { TrendingUp, Baby } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function NameSparkline({ name, compact = false }: { name: string; compact?: boolean }) {
  const data = babyNamesDatabase[name]
    .filter((_, index) => index % 4 === 0)
    .map((item) => ({
      year: item.year,
      percentage: item.percentage,
    }));

  return (
    <div className={`w-full mt-3 ${compact ? 'h-7' : 'h-14'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#8b6914"
            strokeWidth={compact ? 1.5 : 2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HomePage() {
  const popularNames = availableNames;
  const trendingNames = ['Claude', 'ChatGPT', 'Grok'];

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="size-12 text-[#8b6914]" />
            <h1 className="text-6xl text-[#4a3f2f]" style={{ fontFamily: 'Georgia, serif' }}>
              name archive
            </h1>
          </div>
          <p className="text-xl text-[#6b5d4f]" style={{ fontFamily: 'Georgia, serif' }}>
            A Historical Record of American Naming Trends
          </p>
          <div className="mt-4 text-sm text-[#8b7355]">1900 — 2026</div>
        </div>

        {/* Description */}
        <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-8 mb-12 shadow-lg">
          <p className="text-[#4a3f2f] leading-relaxed text-center" style={{ fontFamily: 'Georgia, serif' }}>
            Explore over a century of naming traditions. Each name tells a story of cultural shifts, 
            popular culture influences, and generational preferences. Click any name below to view 
            its complete historical trend from 1900 to present day.
          </p>
        </div>

        {/* Trending */}
        <div className="bg-[#e8ddc4] border-2 border-[#c4a886] rounded-lg p-8 mb-12 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="size-6 text-[#8b6914]" />
            <h2 className="text-3xl text-[#4a3f2f]" style={{ fontFamily: 'Georgia, serif' }}>
              Trending
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingNames.map((name) => (
              <Link
                key={name}
                to={`/n/${name}`}
                className="bg-[#f5f1e8] border-2 border-[#d4b896] rounded-lg p-5 hover:bg-[#efe6d4] hover:border-[#c4a886] transition-all"
              >
                <div className="text-xl text-[#4a3f2f]" style={{ fontFamily: 'Georgia, serif' }}>
                  {name}
                </div>
                <p className="text-sm text-[#8b7355] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Noteworthy momentum in recent years
                </p>
                <NameSparkline name={name} />
              </Link>
            ))}
          </div>
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularNames.map((name) => (
            <Link
              key={name}
              to={`/n/${name}`}
              className="group bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 hover:bg-[#e0d4bb] transition-all hover:shadow-xl hover:border-[#c4a886] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#8b6914] opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative z-10">
                <div className="text-center">
                  <h3 className="text-2xl text-[#4a3f2f] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {name}
                  </h3>
                  <NameSparkline name={name} compact />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center text-[#8b7355] text-sm">
          <p style={{ fontFamily: 'Georgia, serif' }}>
            Data represents relative popularity over time • Peak year normalized to 100%
          </p>
        </div>
      </div>
    </div>
  );
}
