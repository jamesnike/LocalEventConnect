import { Clock, Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (timeFilter: string) => void;
}

const getCurrentDayName = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
};

const getTimeOptions = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const options = [];
  
  // Generate time options for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const dayName = days[date.getDay()];
    const dayPrefix = i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i}`;
    
    // Add date for clarity (e.g., "Wed AM (7/13)")
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
    const displayName = i < 2 ? dayName : `${dayName} (${monthDay})`;
    
    options.push(
      { id: `${dayPrefix}_morning`, name: `${displayName} AM`, icon: Sunrise },
      { id: `${dayPrefix}_afternoon`, name: `${displayName} PM`, icon: Sun },
      { id: `${dayPrefix}_night`, name: `${displayName} Night`, icon: Moon }
    );
  }
  
  return options;
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const timeOptions = getTimeOptions();
  
  // Reorganize options into the desired layout: 
  // Top row: Wed AM, Wed Night, Thu AM, Thu Night...
  // Bottom row: Wed PM, Thu AM, Thu PM, Fri AM...
  const topRowOptions = [];
  const bottomRowOptions = [];
  
  // Pattern: Column 1: Wed AM (top), Wed PM (bottom)
  //         Column 2: Wed Night (top), Thu AM (bottom) 
  //         Column 3: Thu PM (top), Thu Night (bottom)
  //         Column 4: Fri AM (top), Fri PM (bottom)
  for (let i = 0; i < timeOptions.length; i += 3) {
    const dayOptions = timeOptions.slice(i, i + 3); // [AM, PM, Night] for each day
    if (dayOptions.length >= 3) {
      // Column 1: AM on top, PM on bottom
      topRowOptions.push(dayOptions[0]); // AM
      bottomRowOptions.push(dayOptions[1]); // PM
      
      // Column 2: Night on top, next day AM on bottom
      topRowOptions.push(dayOptions[2]); // Night
      if (i + 3 < timeOptions.length) {
        const nextDayAM = timeOptions[i + 3];
        if (nextDayAM) bottomRowOptions.push(nextDayAM);
      }
    }
  }
  
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-col space-y-2 min-w-max">
          {/* Top row: AM, Night, AM, Night... */}
          <div className="flex space-x-2">
            {topRowOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedCategory === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => onCategoryChange(option.id)}
                  className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {option.name}
                </button>
              );
            })}
          </div>
          
          {/* Bottom row: PM, AM, PM, AM... */}
          <div className="flex space-x-2">
            {bottomRowOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedCategory === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => onCategoryChange(option.id)}
                  className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {option.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
