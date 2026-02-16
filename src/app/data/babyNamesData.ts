// Mock data for baby name trends from 1900 to 2026

export interface NameData {
  year: number;
  count: number;
  percentage: number;
}

export interface BabyNameTrend {
  name: string;
  data: NameData[];
}

// Generate trend data for different names with realistic patterns
function generateTrendData(
  startCount: number,
  peakYear: number,
  peakCount: number,
  endCount: number
): NameData[] {
  const data: NameData[] = [];
  
  for (let year = 1900; year <= 2026; year++) {
    let count: number;
    
    if (year < peakYear) {
      // Rise to peak
      const progress = (year - 1900) / (peakYear - 1900);
      count = startCount + (peakCount - startCount) * progress;
    } else {
      // Decline from peak
      const progress = (year - peakYear) / (2026 - peakYear);
      count = peakCount - (peakCount - endCount) * progress;
    }
    
    // Add some random variation
    const variation = (Math.random() - 0.5) * count * 0.1;
    count = Math.max(0, Math.round(count + variation));
    
    data.push({ year, count, percentage: 0 }); // percentage will be calculated next
  }
  
  // Calculate percentages relative to peak
  const maxCount = Math.max(...data.map(d => d.count));
  data.forEach(item => {
    item.percentage = (item.count / maxCount) * 100;
  });
  
  return data;
}

export const babyNamesDatabase: Record<string, NameData[]> = {
  Emma: generateTrendData(1200, 2018, 19800, 15200),
  Olivia: generateTrendData(800, 2020, 18500, 16800),
  Liam: generateTrendData(500, 2019, 20500, 19200),
  Noah: generateTrendData(600, 2016, 19300, 17500),
  Sophia: generateTrendData(1500, 2012, 22500, 14200),
  Isabella: generateTrendData(900, 2010, 22900, 12800),
  Ava: generateTrendData(400, 2014, 15200, 13500),
  Mia: generateTrendData(300, 2015, 14800, 13200),
  Charlotte: generateTrendData(1800, 2019, 13200, 12900),
  Amelia: generateTrendData(600, 2021, 13000, 12800),
  James: generateTrendData(8500, 1950, 86000, 12800),
  William: generateTrendData(7200, 1947, 58000, 11200),
  Benjamin: generateTrendData(2100, 2018, 13500, 12900),
  Lucas: generateTrendData(400, 2020, 11900, 11600),
  Henry: generateTrendData(3200, 1920, 14200, 11100),
  Alexander: generateTrendData(1800, 2009, 16900, 11800),
  Mason: generateTrendData(200, 2011, 19200, 9800),
  Michael: generateTrendData(12000, 1961, 92400, 9300),
  Ethan: generateTrendData(150, 2010, 17800, 9500),
  Daniel: generateTrendData(3500, 1985, 40000, 9200),
  Emily: generateTrendData(8200, 1999, 25900, 8900),
  Abigail: generateTrendData(1200, 2005, 15900, 7600),
  Madison: generateTrendData(300, 2001, 22200, 6500),
  Elizabeth: generateTrendData(9500, 1965, 27500, 7800),
  Harper: generateTrendData(100, 2015, 10900, 10200),
  Evelyn: generateTrendData(4200, 1920, 15600, 9800),
  Ella: generateTrendData(800, 2012, 11900, 10200),
  Grace: generateTrendData(2800, 2003, 12900, 6900),
};

export const availableNames = Object.keys(babyNamesDatabase).sort();
