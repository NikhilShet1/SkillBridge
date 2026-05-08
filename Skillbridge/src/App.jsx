import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerSearch from './pages/CustomerSearch';
import WorkerDashboard from './pages/WorkerDashboard';
import BookingPage from './pages/BookingPage';
import BookingsListPage from './pages/BookingsListPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsub = initialize();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [initialize]);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex flex-col z-10">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<CustomerSearch />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/book/:workerId" element={<BookingPage />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
