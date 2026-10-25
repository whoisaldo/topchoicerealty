import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Home, Search } from 'lucide-react';
import { listingsApi } from '../lib/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { ListingCard } from '../components/ListingCard';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Select } from '../components/Select';
import { ListingCardSkeleton } from '../components/Skeleton';

export function Listings() {
  const [filters, setFilters] = useState({
    q: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    neighborhood: '',
    page: 1,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () =>
      listingsApi.getAll({
        ...filters,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        beds: filters.beds ? Number(filters.beds) : undefined,
        status: 'active',
      }),
  });

  const { data: neighborhoodsData } = useQuery({
    queryKey: ['neighborhoods'],
    queryFn: () => listingsApi.getNeighborhoods(),
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const listings = data?.data.listings;
  const pagination = data?.data.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader title="Browse" accent="Listings" />

        {/* Filters */}
        <Card className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-gold" aria-hidden="true" />
            Filter Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Search"
              placeholder="Search by title or address"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />

            <Select
              label="Neighborhood"
              value={filters.neighborhood}
              onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
            >
              <option value="">All Neighborhoods</option>
              {neighborhoodsData?.data.neighborhoods?.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>

            <FormInput
              label="Min Price"
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />

            <FormInput
              label="Max Price"
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />

            <Select
              label="Min Bedrooms"
              value={filters.beds}
              onChange={(e) => handleFilterChange('beds', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </Select>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Unable to load listings"
            description="Something went wrong while fetching listings. Please try again."
            onRetry={() => refetch()}
          />
        ) : !listings || listings.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No listings found"
            description="Try adjusting your filters to see more results"
          />
        ) : (
          <>
            <div className="mb-4 inline-block rounded-lg border-l-4 border-gold bg-white px-4 py-2 text-sm font-medium text-gray-700">
              Showing {listings.length} of {pagination?.total ?? listings.length} listings
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listings.map((listing, index) => (
                <Reveal key={listing._id} delay={(index % 3) * 100}>
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Card className="flex items-center justify-center gap-4 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>

                <span className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gray-700">
                  Page {filters.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
