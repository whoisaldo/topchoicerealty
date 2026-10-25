import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { MapPin, Phone } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { loginSchema, LoginInput } from '../lib/schemas';
import { ApiError, handleApiError } from '../lib/errorHandler';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import profileImage from '../assets/topchoicerealtypfp.jpg';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error as ApiError, 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Profile */}
          <div className="hidden md:block">
            <div className="text-center mb-8">
              <div className="inline-block mb-6">
                <img
                  src={profileImage}
                  alt="Top Choice Realty"
                  className="w-48 h-48 rounded-full object-cover border-4 border-gold shadow-2xl shadow-gold/30 mx-auto"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-5xl font-bold text-gold tracking-wider mb-2">
                    TOP CHOICE
                  </h1>
                  <p className="text-gold/80 text-lg tracking-widest">REALTY LLC</p>
                </div>
                <div className="border-t border-gold/30 pt-4">
                  <p className="text-gray-300 text-lg mb-2">Our Passion is Our Clients</p>
                  <p className="flex items-center justify-center gap-2 text-gold/90 text-sm">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Serving New York &amp; New Jersey
                  </p>
                  <a
                    href="tel:929-488-3666"
                    className="mt-4 flex items-center justify-center gap-2 text-gold font-semibold text-xl transition-colors hover:text-gold-light"
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                    929-488-3666
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div>
            <Card padding="lg" className="md:p-10 border-gold/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-block md:hidden mb-4">
                  <img
                    src={profileImage}
                    alt="Top Choice Realty"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gold shadow-lg mx-auto"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Agent <span className="text-gold">Login</span>
                </h2>
                <div className="w-16 h-1 bg-gradient-gold mx-auto mb-4 rounded-full"></div>
                <p className="text-gray-600">Access your dashboard and manage listings</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="agent@topchoicerealty.com"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  loadingText="Signing in..."
                >
                  Sign In to Dashboard
                </Button>
              </form>
            </Card>

            <p className="text-center mt-6 text-gray-400 text-sm">
              Protected by session-based authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
