import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthCard } from './components/AuthCard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ComingSoonModal } from './components/ComingSoonModal';
import { X } from 'lucide-react';

function MainAppContent() {
  const { token, role } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState('pro');

  const handleSelectPricingPlan = (tier: string) => {
    setSelectedPlanTier(tier);
    setShowComingSoon(true);
  };

  // If user is authenticated, render role-specific dashboard
  if (token) {
    if (role === 'admin') {
      return <AdminDashboard />;
    } else {
      return <EmployeeDashboard />;
    }
  }

  // Otherwise, render landing portal
  return (
    <>
      <LandingPage
        onLoginClick={() => setShowAuthModal(true)}
        onDemoClick={() => setShowAuthModal(true)}
        onSelectPricingPlan={handleSelectPricingPlan}
      />

      {/* Auth Portal Overlay Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-day-textMuted dark:text-night-textMuted z-10 transition-all"
              aria-label="Close Auth Modal"
            >
              <X size={16} />
            </button>
            <AuthCard onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Coming Soon Waitlist Modal */}
      {showComingSoon && (
        <ComingSoonModal
          planTier={selectedPlanTier}
          onClose={() => setShowComingSoon(false)}
          onLaunchDemo={() => {
            setShowComingSoon(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </>
  );
}

function App() {
  return <MainAppContent />;
}

export default App;
