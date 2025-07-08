import { Star, Music, Activity, Palette, UtensilsCrossed, Laptop } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All', icon: Star },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'sports', name: 'Sports', icon: Activity },
  { id: 'arts', name: 'Arts', icon: Palette },
  { id: 'food', name: 'Food', icon: UtensilsCrossed },
  { id: 'tech', name: 'Tech', icon: Laptop },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
