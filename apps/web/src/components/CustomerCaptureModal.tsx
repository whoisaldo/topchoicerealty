import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Handshake, Save } from 'lucide-react';
import { customerSaleSchema, CustomerSaleInput } from '../lib/schemas';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { Modal } from './Modal';

interface CustomerCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerSaleInput) => void;
  listingTitle: string;
  listingPrice: number;
  isLoading?: boolean;
}

export function CustomerCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  listingTitle,
  listingPrice,
  isLoading,
}: CustomerCaptureModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerSaleInput>({
    resolver: zodResolver(customerSaleSchema),
    defaultValues: {
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: listingPrice,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      size="2xl"
      header="gold"
      title={
        <>
          <Handshake className="h-6 w-6" aria-hidden="true" />
          Capture Customer Details
        </>
      }
      description={`Complete the sale of: ${listingTitle}`}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <FormInput label="Phone" {...register('phone')} error={errors.phone?.message} />
          </div>

          <FormInput
            label="Customer Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="New address of the buyer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Purchase Date"
              type="date"
              {...register('purchaseDate')}
              error={errors.purchaseDate?.message}
            />
            <FormInput
              label="Final Sale Price"
              type="number"
              {...register('purchasePrice', { valueAsNumber: true })}
              error={errors.purchasePrice?.message}
            />
          </div>

          <FormTextarea
            label="Notes"
            rows={3}
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Any special notes about this customer or sale..."
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            isLoading={isLoading}
            loadingText="Saving..."
          >
            <Save className="h-5 w-5" aria-hidden="true" />
            Mark as Sold &amp; Save Customer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
