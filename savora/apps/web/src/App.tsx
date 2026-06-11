import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomNav } from './components/ui/BottomNav';
import { ToastContainer } from './components/ui/Toast';
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
import DietaryProfilePage from './pages/DietaryProfilePage';
import FridgePage from './pages/FridgePage';
import ShoppingListPage from './pages/ShoppingListPage';
import CommunityPage from './pages/CommunityPage';
import CommunityGroupPage from './pages/CommunityGroupPage';
import CommunityReviewsPage from './pages/CommunityReviewsPage';

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <AppLayout>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
            <Route path="/generate/:mood" element={<ProtectedRoute><GenerateMoodPage /></ProtectedRoute>} />
            <Route path="/discovery" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
            <Route path="/discovery/:city" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
            <Route path="/discovery/:city/:restaurantSlug" element={<ProtectedRoute><RestaurantPage /></ProtectedRoute>} />
            <Route path="/discovery/:city/:restaurantSlug/:dishSlug" element={<ProtectedRoute><DishPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/memory" element={<ProtectedRoute><MemoryVaultPage /></ProtectedRoute>} />
            <Route path="/profile/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/genome/identity" element={<ProtectedRoute><IdentityGenomePage /></ProtectedRoute>} />
            <Route path="/genome/flavor" element={<ProtectedRoute><FlavorGenomePage /></ProtectedRoute>} />
            <Route path="/profile/dietary" element={<ProtectedRoute><DietaryProfilePage /></ProtectedRoute>} />
            <Route path="/fridge" element={<ProtectedRoute><FridgePage /></ProtectedRoute>} />
            <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/community/reviews" element={<ProtectedRoute><CommunityReviewsPage /></ProtectedRoute>} />
            <Route path="/community/:identitySlug" element={<ProtectedRoute><CommunityGroupPage /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
