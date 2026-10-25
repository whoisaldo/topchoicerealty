import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Bath, BedDouble, Mail, Ruler, SearchX } from 'lucide-react';
import { listingsApi, inquiriesApi } from '../lib/api';
import { createInquirySchema, CreateInquiryInput } from '../lib/schemas';
import { ApiError, handleApiError } from '../lib/errorHandler';
import { ImageCarousel } from '../components/ImageCarousel';
import { AgentCard } from '../components/AgentCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { PageLoader } from '../components/Spinner';
import { formatPrice, formatNumber } from '../lib/utils';
import type { User } from '../lib/types';

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [showContactForm, setShowContactForm] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
  });

  const listing = data?.data.listing;
  const agent = listing?.agentId as User | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      listingId: id,
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: inquiriesApi.create,
    onSuccess: () => {
      toast.success('Inquiry sent successfully! The agent will contact you soon.');
      reset();
      setShowContactForm(false);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to send inquiry');
    },
  });

  const onSubmit = (formData: CreateInquiryInput) => {
    inquiryMutation.mutate(formData);
  };

  if (isLoading) {
    return <PageLoader label="Loading property..." />;
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState
          title="Unable to load this property"
          description="Something went wrong while fetching this listing. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          icon={SearchX}
          title="Listing not found"
          description="This property may have been removed or the link is incorrect."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageCarousel images={listing.imageUrls} alt={listing.title} />

          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-gray-600">{listing.address}</p>
                <p className="text-sm text-gray-500">{listing.neighborhood}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-gold">
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-gold" aria-hidden="true" />
                <span className="font-semibold">{listing.beds}</span>
                <span className="text-gray-600">Beds</span>
              </div>

              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gold" aria-hidden="true" />
                <span className="font-semibold">{listing.baths}</span>
                <span className="text-gray-600">Baths</span>
              </div>

              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-gold" aria-hidden="true" />
                <span className="font-semibold">{formatNumber(listing.sqft)}</span>
                <span className="text-gray-600">sqft</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {agent && <AgentCard agent={agent} />}

            <Card className="bg-gradient-to-br from-white to-gray-50 border-gold/20">
              {!showContactForm ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Interested in this property?
                  </h3>
                  <Button fullWidth size="lg" onClick={() => setShowContactForm(true)}>
                    <Mail className="h-5 w-5" aria-hidden="true" />
                    Contact Agent
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Send a Message</h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput label="Name" {...register('name')} error={errors.name?.message} />

                    <FormInput
                      label="Email"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                    />

                    <FormInput
                      label="Phone (optional)"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <FormTextarea
                      label="Message"
                      rows={4}
                      {...register('message')}
                      error={errors.message?.message}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        isLoading={inquiryMutation.isPending}
                        loadingText="Sending..."
                      >
                        Send
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowContactForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
