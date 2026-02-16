import { Link } from 'react-router';
import { availableNames } from '../data/babyNamesData';
import { TrendingUp, Baby } from 'lucide-react';

export function HomePage() {
  const popularNames = availableNames;

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="size-12 text-[#8b6914]" />
            <h1 className="text-6xl text-[#4a3f2f]" style={{ fontFamily: 'Georgia, serif' }}>
              Baby Name Archives
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
                  <div className="flex items-center justify-center gap-1 text-[#8b7355] text-sm">
                    <TrendingUp className="size-4" />
                    <span>View Trends</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-[#8b7355] text-sm">
          <p style={{ fontFamily: 'Georgia, serif' }}>
            Data represents relative popularity over time • Peak year normalized to 100%
          </p>
        </div>
      </div>
    </div>
  );
}
