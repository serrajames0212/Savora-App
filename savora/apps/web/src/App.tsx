import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomNav } from './components/ui/BottomNav';
import { useUserStore } from './stores/useUserStore';

import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import GenerateMoodPage from './pages/GenerateMoodPage';
import DiscoveryPage from './pages/DiscoveryPage';
import CityPage from './pages/CityPage';
import RestaurantPage from './pages/RestaurantPage';
import DishPage from './pages/DishPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import MemoryVaultPage from './pages/MemoryVaultPage';
import SubscriptionPage from './pages/SubscriptionPage';
import IdentityGenomePage from './pages/IdentityGenomePage';
import FlavorGenomePage from './pages/FlavorGenomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

const NO_NAV_ROUTES = ['/onboarding', '/login', '/register'];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showNav = !NO_NAV_ROUTES.includes(location.pathname);

  return (
    <>
      <div style={{ paddingBottom: showNav ? '64px' : undefined }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  );
};

const RootRedirect: React.FC = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/home' : '/onboarding'} replace />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/generate/:mood" element={<GenerateMoodPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/discovery/:city" element={<CityPage />} />
            <Route path="/discovery/:city/:restaurantSlug" element={<RestaurantPage />} />
            <Route path="/discovery/:city/:restaurantSlug/:dishSlug" element={<DishPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/memory" element={<MemoryVaultPage />} />
            <Route path="/profile/subscription" element={<SubscriptionPage />} />
            <Route path="/genome/identity" element={<IdentityGenomePage />} />
            <Route path="/genome/flavor" element={<FlavorGenomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
