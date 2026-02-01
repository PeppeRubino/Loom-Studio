import { Route, Routes, Navigate } from 'react-router-dom';

import { Suspense, lazy } from 'react';

import { AuthGate } from '@/features/auth/AuthGate';
import { Splash } from '@/components/ui/Splash';

const AppLayout = lazy(() => import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })));
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <Suspense fallback={<Splash />}>
          <LoginPage />
        </Suspense>
      }
    />
    <Route
      path="/app"
      element={
        <AuthGate>
          <Suspense fallback={<Splash />}>
            <AppLayout />
          </Suspense>
        </AuthGate>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={<Splash />}>
            <HomePage />
          </Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Splash />}>
            <ProfilePage />
          </Suspense>
        }
      />
    </Route>
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route
      path="*"
      element={
        <Suspense fallback={<Splash />}>
          <NotFoundPage />
        </Suspense>
      }
    />
  </Routes>
);
