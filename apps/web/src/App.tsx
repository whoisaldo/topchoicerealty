import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/auth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './routes/Home';
import { Listings } from './routes/Listings';
import { ListingDetail } from './routes/ListingDetail';
import { Agents } from './routes/Agents';
import { Login } from './routes/Login';
import { Dashboard } from './routes/Dashboard';
import { Profile } from './routes/Profile';
import { Customers } from './routes/Customers';
import { NotFound } from './routes/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111111',
                color: '#fafaf9',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '0.75rem',
              },
              success: {
                iconTheme: { primary: '#d4af37', secondary: '#111111' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
