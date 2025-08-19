import { createFileRoute, redirect } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js';
import { useAuth } from '../../auth/AuthContext';
import { Link, useRouter } from '@tanstack/solid-router';

export const Route = createFileRoute('/(auth)/signup')({
  component: SignupPage,
})


function SignupPage() {
  const { register, authState, clearError } = useAuth();
  const router = useRouter();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordConfirm, setPasswordConfirm] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await register({ email: email(), password: password(), passwordConfirm: passwordConfirm(), name: name() });
      router.navigate({ to: '/' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div class="w-full max-w-md rounded-lg shadow p-6">
        <h1 class="text-2xl font-semibold mb-1">Create account</h1>
        <p class="text-sm text-gray-600 mb-6">Join Zahrawi Clinic to manage patients and appointments.</p>

        <Show when={authState().error}>
          <div class="mb-4 rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2" role="alert">
            {authState().error}
          </div>
        </Show>

        <form onSubmit={onSubmit} class="space-y-4" novalidate>
          <div>
            <label for="name" class="block text-sm font-medium mb-1">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
          </div>

          <div>
            <label for="passwordConfirm" class="block text-sm font-medium mb-1">Confirm password</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={passwordConfirm()}
              onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting() || authState().isLoading}
            class="w-full inline-flex justify-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting() || authState().isLoading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div class="mt-4 text-sm">
          Already have an account? <Link to="/login" class="text-indigo-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;


