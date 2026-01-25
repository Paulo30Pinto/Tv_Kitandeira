import { Tv, Globe2, Film, Info, Trophy, Music, GraduationCap, Globe, Smile } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  activeCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const menuItems = [
    { id: 'All', label: 'Todos os Canais', icon: Tv },
    { id: Category.NEWS, label: 'Notícias', icon: Globe2 },
    { id: Category.KIDS, label: 'Infantil', icon: Smile },
    { id: Category.SPORTS, label: 'Desporto', icon: Trophy },
    { id: Category.EDUCATION, label: 'Educação & Gov', icon: GraduationCap },
    { id: Category.INTERNATIONAL, label: 'Internacional', icon: Globe },
    { id: Category.MUSIC, label: 'Música', icon: Music },
    { id: Category.GENERAL, label: 'Variedades', icon: Film },
    { id: Category.PUBLIC, label: 'Públicos', icon: Info },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 h-full p-6">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
          <Tv size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          LusoTV
        </h1>
      </div>

      <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeCategory === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id as Category | 'All')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium
                ${isActive 
                  ? 'bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/50' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            Pressione <strong>ESC</strong> para sair do player de vídeo. Use o teclado ou toque para navegar.
          </p>
        </div>
      </div>
    </div>
  );
};