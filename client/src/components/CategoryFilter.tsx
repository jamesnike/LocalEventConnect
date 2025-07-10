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
  
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="space-y-2">
        {/* First row */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {timeOptions.slice(0, Math.ceil(timeOptions.length / 2)).map((option) => {
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
        
        {/* Second row */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {timeOptions.slice(Math.ceil(timeOptions.length / 2)).map((option) => {
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
  );
}
