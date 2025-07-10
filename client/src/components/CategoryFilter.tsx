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
  // Bottom row: Wed PM, Thu PM, Fri AM, Fri PM...
  const topRowOptions = [];
  const bottomRowOptions = [];
  
  // Create balanced alternating pattern:
  // Split all options into two even rows
  for (let i = 0; i < timeOptions.length; i++) {
    if (i % 2 === 0) {
      topRowOptions.push(timeOptions[i]);
    } else {
      bottomRowOptions.push(timeOptions[i]);
    }
  }
  
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="pb-2 scrollbar-always" style={{ overflowX: 'scroll' }}>
        <div className="flex flex-col space-y-2" style={{ minWidth: 'calc(100% + 50px)' }}>
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
