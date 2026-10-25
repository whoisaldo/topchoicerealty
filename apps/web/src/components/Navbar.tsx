import { Fragment, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';
import { ButtonLink } from './ButtonLink';

const navLinks = [
  { to: '/', label: 'HOME' },
  { to: '/listings', label: 'LISTINGS' },
  { to: '/agents', label: 'AGENTS' },
];

const accountLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-black border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              <Home className="h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <span className="font-display text-2xl font-bold text-gold tracking-wider">
                  TOP CHOICE
                </span>
                <div className="text-xs text-gold/80 tracking-widest">REALTY LLC</div>
              </div>
            </Link>

            <div className="hidden md:flex ml-12 space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
                      isActive ? 'text-gold' : 'text-gray-300 hover:text-gold'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-gray-300 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
                  <Avatar src={user?.photoUrl} alt="" size="sm" />
                  <span className="font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gold/30 bg-black py-2 shadow-2xl z-50 focus:outline-none">
                    {accountLinks.map(({ to, label, icon: Icon }) => (
                      <Menu.Item key={to}>
                        {({ active }) => (
                          <Link
                            to={to}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                              active ? 'bg-gold/10 text-gold' : 'text-gray-300'
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                    <div className="my-2 border-t border-gold/20" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                            active ? 'bg-red-500/10 text-red-400' : 'text-gray-300'
                          )}
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <ButtonLink to="/login" size="sm">
                Agent Login
              </ButtonLink>
            )}
          </div>

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-gray-300 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gold/20 bg-black">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm font-medium tracking-wide transition-colors',
                    isActive ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-gold/20" />

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar src={user?.photoUrl} alt="" size="sm" />
                  <span className="text-sm font-medium text-gray-300">{user?.name}</span>
                </div>
                {accountLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gold/5 hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <ButtonLink to="/login" size="sm" fullWidth>
                Agent Login
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
