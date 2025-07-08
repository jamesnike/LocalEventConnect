import { Home, Calendar, Search, User } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  currentPage: string;
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: 'home', name: 'Home', icon: Home, path: '/' },
    { id: 'my-events', name: 'My Events', icon: Calendar, path: '/my-events' },
    { id: 'browse', name: 'Browse', icon: Search, path: '/browse' },
    { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 z-20">
      <div className="flex">
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
      </div>
    </nav>
  );
}
