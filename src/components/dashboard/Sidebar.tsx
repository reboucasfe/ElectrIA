import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/settings', icon: Settings, label: 'Configurações' },
    { href: '/upgrade', icon: Crown, label: 'Upgrade' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r">
      <div className="p-4 border-b">
        <Link to="/#planos" className="flex items-center">
          <Crown className="h-8 w-8 text-amber-500 mr-2" /> {/* Ícone de coroa em dourado */}
          <span className="text-xl font-bold text-amber-600">EletroProposta IA</span> {/* Texto em dourado */}
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200',
                isActive && 'bg-blue-600 text-white hover:bg-blue-700'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;