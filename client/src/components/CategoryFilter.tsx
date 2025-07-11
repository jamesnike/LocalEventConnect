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
  
  // Generate time options for the next 7 days using user's local timezone
  for (let i = 0; i < 7; i++) {
    // Create date in user's local timezone
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dayName = days[date.getDay()];
    const dayPrefix = i === 0 ? 'today' : `day${i}`;
    
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
  
  // Reorganize options into day-based columns:
  // Each day has 3 buttons stacked vertically: AM, PM, Night
  const dayGroups = [];
  
  // Group options by day (every 3 consecutive options belong to the same day)
  for (let i = 0; i < timeOptions.length; i += 3) {
    dayGroups.push([
      timeOptions[i],     // AM
      timeOptions[i + 1], // PM  
      timeOptions[i + 2]  // Night
    ]);
  }
  
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="pb-2 scrollbar-always" style={{ overflowX: 'scroll' }}>
        <div className="flex space-x-1.5" style={{ minWidth: 'calc(100% + 50px)' }}>
          {dayGroups.map((dayGroup, dayIndex) => (
            <div key={dayIndex} className="flex flex-col space-y-1.5">
              {dayGroup.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedCategory === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => onCategoryChange(option.id)}
                    className={`w-20 flex items-center justify-center px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {option.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
