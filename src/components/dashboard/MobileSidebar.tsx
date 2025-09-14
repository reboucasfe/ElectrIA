import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Zap, Crown } from 'lucide-react'; // Importando Crown
import { cn } from '@/lib/utils';

const MobileSidebar = () => {
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/upgrade', icon: Crown, label: 'Upgrade Plano' }, // Alterado para Crown e 'Upgrade Plano'
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b">
        <Link to="/#planos" className="flex items-center">
          <Zap className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EletroProposta IA</span>
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

export default MobileSidebar;