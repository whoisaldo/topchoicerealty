import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { customersApi } from '../lib/api';
import { customerSchema, CustomerInput } from '../lib/schemas';
import { ApiError, handleApiError } from '../lib/errorHandler';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { PageHeader } from '../components/PageHeader';
import { TableSkeleton } from '../components/Skeleton';
import { formatPrice, formatDate } from '../lib/utils';
import type { Customer, Listing } from '../lib/types';

const EMPTY_CUSTOMER_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  purchaseDate: '',
  purchasePrice: undefined,
  notes: '',
};

export function Customers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: () => customersApi.getAll({ q: searchQuery || undefined }),
  });

  const customers = data?.data.customers;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_CUSTOMER_FORM,
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      toast.success('Customer added successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsCreating(false);
      reset(EMPTY_CUSTOMER_FORM);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to add customer');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: customerData }: { id: string; data: Partial<Customer> }) =>
      customersApi.update(id, customerData),
    onSuccess: () => {
      toast.success('Customer updated!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingId(null);
      setIsCreating(false);
      reset(EMPTY_CUSTOMER_FORM);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to update customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      toast.success('Customer deleted!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteTarget(null);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to delete customer');
    },
  });

  const onSubmit = (formData: CustomerInput) => {
    const customerData = {
      ...formData,
      purchaseDate: formData.purchaseDate || undefined,
      purchasePrice: formData.purchasePrice || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: customerData });
    } else {
      createMutation.mutate(customerData);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    reset(EMPTY_CUSTOMER_FORM);
    setIsCreating(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer._id);
    setIsCreating(true);
    reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address ?? '',
      purchaseDate: customer.purchaseDate?.split('T')[0] ?? '',
      purchasePrice: customer.purchasePrice ?? undefined,
      notes: customer.notes ?? '',
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    reset(EMPTY_CUSTOMER_FORM);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Customer"
          accent="Database"
          description="Track and manage your past clients"
        />

        {/* Search and Actions */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <FormInput
                label="Search Customers"
                placeholder="Search by name, email, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!isCreating && (
              <Button onClick={handleAddNew} size="lg">
                <Plus className="h-5 w-5" aria-hidden="true" />
                Add Customer
              </Button>
            )}
          </div>
        </Card>

        {/* Add/Edit Form */}
        {isCreating && (
          <Card padding="lg" className="mb-8 border-gold/20 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <div className="w-20 h-1 bg-gradient-gold mb-6 rounded-full"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                <FormInput
                  label="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
                <FormInput
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <FormInput label="Phone" {...register('phone')} error={errors.phone?.message} />
                <FormInput
                  label="Purchase Date"
                  type="date"
                  {...register('purchaseDate')}
                  error={errors.purchaseDate?.message}
                />
                <FormInput
                  label="Purchase Price"
                  type="number"
                  {...register('purchasePrice', { valueAsNumber: true })}
                  error={errors.purchasePrice?.message}
                />
              </div>

              <FormInput label="Address" {...register('address')} error={errors.address?.message} />

              <FormTextarea
                label="Notes"
                rows={3}
                {...register('notes')}
                error={errors.notes?.message}
                placeholder="Any special notes about this customer..."
              />

              <div className="flex flex-col sm:flex-row gap-4">
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
                  {editingId ? 'Update' : 'Add'} Customer
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Customer List */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <ErrorState
            title="Unable to load customers"
            description="Something went wrong while fetching your customers. Please try again."
            onRetry={() => refetch()}
          />
        ) : !customers || customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description={
              searchQuery ? 'No customers match your search' : 'Add customers as you close deals'
            }
          />
        ) : (
          <Card padding="none" className="overflow-hidden border-gold/20 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gold/10 to-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Purchase
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const listing = customer.listingId as Listing | undefined;
                    return (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.address && (
                            <div className="text-sm text-gray-500">{customer.address}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-gold hover:text-gold-dark"
                            >
                              {customer.email}
                            </a>
                          </div>
                          <div className="text-sm text-gray-600">{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          {listing && typeof listing === 'object' ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{listing.title}</div>
                              <div className="text-gray-500">{listing.address}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No property linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {customer.purchasePrice && (
                            <div className="font-bold text-gold">
                              {formatPrice(customer.purchasePrice)}
                            </div>
                          )}
                          {customer.purchaseDate && (
                            <div className="text-sm text-gray-600">
                              {formatDate(customer.purchaseDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(customer)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gold/5 px-6 py-4 border-t border-gold/20">
              <p className="text-sm text-gray-600">
                Total Customers:{' '}
                <span className="font-bold text-gold">{customers.length}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
          title="Delete customer?"
          description={
            deleteTarget
              ? `${deleteTarget.firstName} ${deleteTarget.lastName} will be permanently removed from your customer database.`
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
