import { Link } from 'react-router-dom';
import { Bath, BedDouble, Ruler } from 'lucide-react';
import { Listing } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { Badge } from './Badge';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block overflow-hidden rounded-2xl bg-white border-2 border-gold/15 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={listing.imageUrls[0]}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-black/60 text-gold border-gold/40 backdrop-blur-sm">
          {listing.status}
        </Badge>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-1">{listing.address}</p>
        <p className="text-xs text-gray-500 mb-3">{listing.neighborhood}</p>
        <p className="font-display text-2xl font-bold text-gold mb-4">
          {formatPrice(listing.price)}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-700 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-semibold">{listing.beds}</span>
            <span className="sr-only">beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-semibold">{listing.baths}</span>
            <span className="sr-only">baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-semibold">{listing.sqft.toLocaleString()}</span>
            <span className="sr-only">square feet</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
