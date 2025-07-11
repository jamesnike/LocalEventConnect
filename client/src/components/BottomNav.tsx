import { Home, Calendar, Search, User, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  currentPage: string;
  onCreateEvent?: () => void;
}

export default function BottomNav({ currentPage, onCreateEvent }: BottomNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: 'home', name: 'Home', icon: Home, path: '/' },
    { id: 'my-events', name: 'My Events', icon: Calendar, path: '/my-events' },
  ];

  const rightNavItems = [
    { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 z-20">
      <div className="flex items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`flex-1 py-3 text-center transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{item.name}</span>
            </button>
          );
        })}
        
        {/* Create Event Button */}
        {onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center mx-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
        
        {rightNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`flex-1 py-3 text-center transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
