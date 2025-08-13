import type { Component } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

const NotFoundPage: Component = () => {
  const navigate = useNavigate();
  return (
    <div class="flex items-center justify-center p-6">
      <div class="max-w-md w-full border border-gray-200 rounded-lg p-6 text-center">
        <div class="text-6xl font-extrabold text-gray-100">404</div>
        <h1 class="mt-2 text-xl font-semibold text-gray-200">Page not found</h1>
        <p class="mt-1 text-sm text-gray-300">The page you are looking for doesn’t exist or has moved.</p>
        <div class="mt-4 flex items-center justify-center gap-3">
          <button
            class="px-4 py-2 rounded border hover:bg-gray-50"
            onClick={() => navigate({ to: '/' })}
          >
            Go to Dashboard
          </button>
          <button
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate({ to: '/' })}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


