import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Home, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { agentListingsApi, customersApi } from '../lib/api';
import { listingFormSchema, ListingFormInput, CustomerSaleInput } from '../lib/schemas';
import { ApiError, handleApiError } from '../lib/errorHandler';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomerCaptureModal } from '../components/CustomerCaptureModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { Select } from '../components/Select';
import { TableSkeleton } from '../components/Skeleton';
import { formatPrice, formatDate, getStatusBadgeColor } from '../lib/utils';
import { useAuth } from '../lib/auth';
import type { Listing } from '../lib/types';

const EMPTY_LISTING_FORM = {
  title: '',
  address: '',
  neighborhood: '',
  price: undefined,
  beds: undefined,
  baths: undefined,
  sqft: undefined,
  description: '',
  imageUrlsText: '',
  status: 'active' as const,
};

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [soldModalListing, setSoldModalListing] = useState<Listing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['agent-listings'],
    queryFn: () => agentListingsApi.getAll(),
  });

  const listings = data?.data.listings;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: EMPTY_LISTING_FORM,
  });

  const createMutation = useMutation({
    mutationFn: agentListingsApi.create,
    onSuccess: () => {
      toast.success('Listing created successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent-listings'] });
      setIsCreating(false);
      reset(EMPTY_LISTING_FORM);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to create listing');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: listingData }: { id: string; data: Partial<Listing> }) =>
      agentListingsApi.update(id, listingData),
    onSuccess: () => {
      toast.success('Listing updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent-listings'] });
      setEditingId(null);
      setIsCreating(false);
      reset(EMPTY_LISTING_FORM);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to update listing');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'pending' | 'sold' }) =>
      agentListingsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated!');
      queryClient.invalidateQueries({ queryKey: ['agent-listings'] });
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to update status');
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (customerData: CustomerSaleInput & { listingId: string }) =>
      customersApi.create(customerData),
    onSuccess: () => {
      toast.success('Customer saved! Listing marked as sold.');
      queryClient.invalidateQueries({ queryKey: ['agent-listings'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSoldModalListing(null);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to save customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: agentListingsApi.delete,
    onSuccess: () => {
      toast.success('Listing deleted!');
      queryClient.invalidateQueries({ queryKey: ['agent-listings'] });
      setDeleteTarget(null);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to delete listing');
    },
  });

  const onSubmit = (formData: ListingFormInput) => {
    const { imageUrlsText, ...rest } = formData;
    const listingData = {
      ...rest,
      imageUrls: imageUrlsText
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: listingData });
    } else {
      createMutation.mutate(listingData);
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    reset(EMPTY_LISTING_FORM);
    setIsCreating(true);
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing._id);
    setIsCreating(true);
    reset({
      title: listing.title,
      address: listing.address,
      neighborhood: listing.neighborhood,
      price: listing.price,
      beds: listing.beds,
      baths: listing.baths,
      sqft: listing.sqft,
      description: listing.description,
      status: listing.status,
      imageUrlsText: listing.imageUrls.join('\n'),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    reset(EMPTY_LISTING_FORM);
  };

  const handleStatusChange = (listing: Listing, newStatus: string) => {
    if (newStatus === 'sold') {
      setSoldModalListing(listing);
    } else {
      updateStatusMutation.mutate({
        id: listing._id,
        status: newStatus as 'active' | 'pending',
      });
    }
  };

  const handleCustomerCapture = (customerData: CustomerSaleInput) => {
    if (!soldModalListing) return;

    createCustomerMutation.mutate({
      ...customerData,
      listingId: soldModalListing._id,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header with Profile */}
        <Card className="mb-8 border-gold/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar src={user?.photoUrl} alt={user?.name ?? 'Agent'} size="md" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            {!isCreating && (
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="h-5 w-5" aria-hidden="true" />
                Create New Listing
              </Button>
            )}
          </div>
        </Card>

        {isCreating && (
          <Card padding="lg" className="mb-8 border-gold/20 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {editingId ? 'Edit Listing' : 'Create New Listing'}
            </h2>
            <div className="w-20 h-1 bg-gradient-gold mb-6 rounded-full"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput label="Title" {...register('title')} error={errors.title?.message} />

                <FormInput
                  label="Address"
                  {...register('address')}
                  error={errors.address?.message}
                />

                <FormInput
                  label="Neighborhood"
                  {...register('neighborhood')}
                  error={errors.neighborhood?.message}
                />

                <FormInput
                  label="Price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  error={errors.price?.message}
                />

                <FormInput
                  label="Beds"
                  type="number"
                  {...register('beds', { valueAsNumber: true })}
                  error={errors.beds?.message}
                />

                <FormInput
                  label="Baths"
                  type="number"
                  step="0.5"
                  {...register('baths', { valueAsNumber: true })}
                  error={errors.baths?.message}
                />

                <FormInput
                  label="Square Feet"
                  type="number"
                  {...register('sqft', { valueAsNumber: true })}
                  error={errors.sqft?.message}
                />

                <Select label="Status" {...register('status')} error={errors.status?.message}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </Select>
              </div>

              <FormTextarea
                label="Description"
                rows={4}
                {...register('description')}
                error={errors.description?.message}
              />

              <FormTextarea
                label="Image URLs (one per line)"
                rows={3}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                {...register('imageUrlsText')}
                error={errors.imageUrlsText?.message}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  loadingText="Saving..."
                >
                  {editingId ? (
                    <Save className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  )}
                  {editingId ? 'Update' : 'Create'} Listing
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : isError ? (
          <ErrorState
            title="Unable to load your listings"
            description="Something went wrong while fetching your listings. Please try again."
            onRetry={() => refetch()}
          />
        ) : !listings || listings.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No listings yet"
            description="Get started by creating your first listing"
            action={
              !isCreating ? (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Create New Listing
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card padding="none" className="overflow-hidden border-gold/20 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gold/10 to-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            className="w-20 h-20 rounded-lg object-cover border-2 border-gold/20 shadow-md"
                          />
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">{listing.title}</div>
                            <div className="text-sm text-gray-600">{listing.address}</div>
                            <div className="text-xs text-gray-500">{listing.neighborhood}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gold">
                          {formatPrice(listing.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={listing.status}
                          onChange={(e) => handleStatusChange(listing, e.target.value)}
                          aria-label={`Status for ${listing.title}`}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${getStatusBadgeColor(
                            listing.status
                          )}`}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(listing.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(listing)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(listing)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Customer Capture Modal */}
        {soldModalListing && (
          <CustomerCaptureModal
            isOpen={!!soldModalListing}
            onClose={() => setSoldModalListing(null)}
            onSubmit={handleCustomerCapture}
            listingTitle={soldModalListing.title}
            listingPrice={soldModalListing.price}
            isLoading={createCustomerMutation.isPending}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
          title="Delete listing?"
          description={
            deleteTarget
              ? `"${deleteTarget.title}" will be permanently deleted. This cannot be undone.`
              : undefined
          }
          confirmLabel="Delete"
          danger
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
