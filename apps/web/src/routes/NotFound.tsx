import { Home, Search } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';

export function NotFound() {
  return (
    <div className="min-h-[60vh] bg-gradient-dark flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="font-display text-7xl md:text-9xl font-bold text-gold">404</p>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ButtonLink to="/">
            <Home className="h-5 w-5" aria-hidden="true" />
            Back to Home
          </ButtonLink>
          <ButtonLink to="/listings" variant="outline">
            <Search className="h-5 w-5" aria-hidden="true" />
            Browse Listings
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
