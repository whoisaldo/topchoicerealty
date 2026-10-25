import { Link } from 'react-router-dom';
import { Home, Mail, MapPin, Phone } from 'lucide-react';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Browse Listings' },
  { to: '/agents', label: 'Meet Our Agents' },
  { to: '/login', label: 'Agent Login' },
];

export function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Home className="h-7 w-7 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="text-gold text-lg font-bold tracking-wider">TOP CHOICE</h3>
                <p className="text-gold/80 text-xs tracking-widest">REALTY LLC</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 italic">Our passion is Our clients.</p>
            <p className="mt-2 text-sm text-gray-400">Serving New York and New Jersey.</p>
          </div>

          <div>
            <h4 className="font-sans text-gold text-sm font-semibold mb-4 tracking-wider">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-gold text-sm font-semibold mb-4 tracking-wider">
              CONTACT US
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  Serving New York &amp; New Jersey
                  <br />
                  Based in Staten Island, NY
                </span>
              </li>
              <li>
                <a
                  href="tel:929-488-3666"
                  className="flex items-center gap-3 text-gold transition-colors hover:text-gold-light"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  929-488-3666
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@topchoicerealty.com"
                  className="flex items-center gap-3 transition-colors hover:text-gold"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  info@topchoicerealty.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Top Choice Realty LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
