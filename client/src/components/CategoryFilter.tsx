import { Clock, Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (timeFilter: string) => void;
}

const getCurrentDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getTimeOptions = () => {
  const currentDay = getCurrentDayName();
  const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nextDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDay.getDay()];
  
  return [
    { id: 'all', name: 'All Times', icon: Clock },
    { id: 'today_morning', name: `${currentDay} Morning`, icon: Sunrise },
    { id: 'today_afternoon', name: `${currentDay} Afternoon`, icon: Sun },
    { id: 'today_evening', name: `${currentDay} Evening`, icon: Sunset },
    { id: 'today_night', name: `${currentDay} Night`, icon: Moon },
    { id: 'tomorrow_morning', name: `${nextDayName} Morning`, icon: Sunrise },
    { id: 'tomorrow_afternoon', name: `${nextDayName} Afternoon`, icon: Sun },
    { id: 'tomorrow_evening', name: `${nextDayName} Evening`, icon: Sunset },
  ];
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const timeOptions = getTimeOptions();
  
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {timeOptions.map((option) => {
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
  );
}
