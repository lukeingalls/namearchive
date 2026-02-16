import { useParams, Link } from 'react-router';
import { babyNamesDatabase } from '../data/babyNamesData';
import { NameTrendChart } from '../components/NameTrendChart';
import { ArrowLeft, Calendar, TrendingUp, Activity } from 'lucide-react';

export function NamePage() {
  const { name } = useParams<{ name: string }>();
  
  if (!name || !babyNamesDatabase[name]) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl text-[#4a3f2f] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Name Not Found
          </h1>
          <Link
            to="/"
            className="text-[#8b6914] hover:underline"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Return to Archives
          </Link>
        </div>
      </div>
    );
  }

  const currentData = babyNamesDatabase[name];
  const peakData = currentData.reduce((max, item) => 
    item.count > max.count ? item : max
  );
  const currentYear = currentData[currentData.length - 1];
  const startYear = currentData[0];

  return (
    <div>
      {/* Navigation */}
      <div className="border-b-2 border-[#d4b896] bg-[#ebe4d1]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#8b6914] hover:text-[#6b5914] transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <ArrowLeft className="size-5" />
            Back to Archives
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Name Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <div className="bg-[#ebe4d1] border-4 border-[#8b6914] rounded-lg px-12 py-8 shadow-2xl">
              <h1 
                className="text-7xl text-[#4a3f2f] mb-2" 
                style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}
              >
                babies named <span className="text-[#8b6914]">{name}</span>
              </h1>
              <div className="h-1 bg-[#8b6914] w-full mt-4" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="size-6 text-[#8b6914]" />
              <h3 className="text-lg text-[#6b5d4f]" style={{ fontFamily: 'Georgia, serif' }}>
                Peak Year
              </h3>
            </div>
            <p className="text-5xl text-[#8b6914]" style={{ fontFamily: 'Georgia, serif' }}>
              {peakData.year}
            </p>
            <p className="text-sm text-[#8b7355] mt-2">
              {peakData.count.toLocaleString()} babies
            </p>
          </div>

          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="size-6 text-[#8b6914]" />
              <h3 className="text-lg text-[#6b5d4f]" style={{ fontFamily: 'Georgia, serif' }}>
                Current Trend
              </h3>
            </div>
            <p className="text-5xl text-[#8b6914]" style={{ fontFamily: 'Georgia, serif' }}>
              {currentYear.percentage.toFixed(0)}%
            </p>
            <p className="text-sm text-[#8b7355] mt-2">
              of peak popularity
            </p>
          </div>

          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="size-6 text-[#8b6914]" />
              <h3 className="text-lg text-[#6b5d4f]" style={{ fontFamily: 'Georgia, serif' }}>
                Change Since 1900
              </h3>
            </div>
            <p className="text-5xl text-[#8b6914]" style={{ fontFamily: 'Georgia, serif' }}>
              {((currentYear.percentage - startYear.percentage) > 0 ? '+' : '')}
              {(currentYear.percentage - startYear.percentage).toFixed(0)}%
            </p>
            <p className="text-sm text-[#8b7355] mt-2">
              percentage points
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-8 shadow-lg">
          <h2 
            className="text-3xl text-[#4a3f2f] mb-6 text-center" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Historical Trend Analysis
          </h2>
          <div className="bg-[#f5f1e8] border border-[#d4b896] rounded-lg p-6">
            <NameTrendChart data={currentData} name={name} />
          </div>
          <p className="text-center text-[#8b7355] mt-6 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            Relative popularity shown as percentage of peak year • Data spans 1900—2026
          </p>
        </div>

        {/* Interpretation */}
        <div className="mt-12 bg-[#e0d4bb] border-2 border-[#c4a886] rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl text-[#4a3f2f] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            About This Data
          </h3>
          <p className="text-[#4a3f2f] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            This chart shows the relative popularity of the name <span className="font-semibold">{name}</span> from 
            1900 to 2026. The peak year ({peakData.year}) is normalized to 100%, and all other years are shown 
            as a percentage of that peak. This allows you to see the rise and fall of the name's popularity 
            independent of overall population growth.
          </p>
        </div>
      </div>
    </div>
  );
}
