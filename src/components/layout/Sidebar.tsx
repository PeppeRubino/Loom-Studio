import { NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Dashboard', path: '/' },
  { label: 'Wardrobe', path: '/wardrobe' },
  { label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  return (
    <aside className="hidden w-[260px] flex-col border-r border-[#e6e6e8] bg-white/90 p-5  lg:flex">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">Workspace</p>
      <nav className="flex flex-col gap-2">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `rounded-[10px] px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#f6d6da] text-[#b11226] shadow-[0_8px_20px_-12px_rgba(177,18,38,0.45)]'
                  : 'text-[#5e5e5e] hover:bg-[#f7f7f8]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
