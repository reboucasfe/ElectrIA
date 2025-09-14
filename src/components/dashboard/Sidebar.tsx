import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/upgrade', icon: Zap, label: 'Eletro Proposta' },
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r">
      <div className="p-4 border-b">
        <Link to="/">
          <h2 className="text-xl font-bold">EletroProposta IA</h2>
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