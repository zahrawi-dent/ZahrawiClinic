/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/solid-query';
import { queryClient } from './lib/queryClient';

const root = document.getElementById('root')

render(() => <Index />, root!)

function Index() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
