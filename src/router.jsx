import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Index = lazy(() => import('./pages/Index'));
const Playground = lazy(() => import('./pages/Playground'));
const Library = lazy(() => import('./pages/Library'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
          <Index />
        </Suspense>
      ),
    },
    {
      path: '/playground',
      element: (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
          <Playground />
        </Suspense>
      ),
    },
    {
      path: '/library',
      element: (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
          <Library />
        </Suspense>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
          <Dashboard />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
          <NotFound />
        </Suspense>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);