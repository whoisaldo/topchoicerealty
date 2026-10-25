import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Phone, RotateCcw, Save } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { authApi } from '../lib/api';
import { updateProfileSchema, UpdateProfileInput } from '../lib/schemas';
import { ApiError, handleApiError } from '../lib/errorHandler';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { PageHeader } from '../components/PageHeader';

export function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: user
      ? {
          name: user.name,
          phone: user.phone,
          photoUrl: user.photoUrl ?? '',
          bio: user.bio ?? '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (response) => {
      toast.success('Profile updated successfully!');
      queryClient.setQueryData(['auth', 'me'], response.data.user);
    },
    onError: (error: ApiError) => {
      handleApiError(error, 'Failed to update profile');
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    updateMutation.mutate({ ...data, photoUrl: data.photoUrl || undefined });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader title="Agent" accent="Profile" />

        <Card padding="lg" className="border-gold/10 shadow-xl">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar src={user.photoUrl} alt={user.name} size="xl" />
                <Badge className="absolute -bottom-2 -right-2 bg-gold text-black border-transparent">
                  {user.role}
                </Badge>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <p className="flex items-center justify-center md:justify-start gap-2 text-gold font-semibold">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {user.phone}
                </p>
                {user.bio && (
                  <p className="text-gray-700 mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gold">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Update Profile Information
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput label="Full Name" {...register('name')} error={errors.name?.message} />

                <FormInput label="Phone" {...register('phone')} error={errors.phone?.message} />
              </div>

              <FormInput
                label="Photo URL"
                {...register('photoUrl')}
                error={errors.photoUrl?.message}
                placeholder="https://example.com/your-photo.jpg"
              />

              <FormTextarea
                label="Bio"
                rows={4}
                {...register('bio')}
                error={errors.bio?.message}
                placeholder="Tell potential clients about yourself..."
              />

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  isLoading={updateMutation.isPending}
                  loadingText="Saving..."
                  size="lg"
                >
                  <Save className="h-5 w-5" aria-hidden="true" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => reset()}>
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
