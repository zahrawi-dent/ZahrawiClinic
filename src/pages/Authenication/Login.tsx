// src/pages/LoginPage.jsx
import { createSignal, onMount } from "solid-js";
import { createPocketBaseClient, loginAdmin, persistConnection, restoreConnection } from "../../services/pocketbase";

export default function LoginPage({ onConnect }: { onConnect: () => void }) {
  const [serverUrl, setServerUrl] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [showPassword, setShowPassword] = createSignal(false);
  const [isRestoring, setIsRestoring] = createSignal(true);


  onMount(() => {
    // Try to restore previous connection
    if (restoreConnection()) {
      onConnect();
    }
    setIsRestoring(false);
  });

  const handleConnect = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate URL format
      const url = serverUrl().trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Server URL must start with http:// or https://');
      }

      // Initialize PocketBase client
      // NOTE: Don't Delete
      const pb = createPocketBaseClient(url);

      // Authenticate with admin credentials
      await loginAdmin(email(), password()).catch((err) => {
        throw new Error(err.message);
      });

      // Store connection details
      persistConnection(url);

      // Notify parent component that we're connected
      onConnect();
    } catch (err) {
      console.error("Authentication failed:", err);
      setError(err.message || "Failed to connect to PocketBase. Please check your credentials and server URL.");
    } finally {
      setIsLoading(false);
    }

  };


  return (
    <>
      {isRestoring() ? (
        <div class="min-h-screen flex items-center justify-center bg-gray-100">
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-700 mb-4">Zahrawi Clinic</div>
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p class="mt-4 text-gray-600">Restoring connection...</p>
          </div>
        </div>
      ) :
        <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Zahrawi Clinic
              </h2>
              <p class="mt-2 text-center text-sm text-gray-600">
                Connect to your PocketBase instance
              </p>
            </div>

            <form class="mt-8 space-y-6" onSubmit={handleConnect}>
              <div class="space-y-4">
                <div>
                  <label for="server-url" class="block text-sm font-medium text-gray-700">
                    PocketBase Server URL
                  </label>
                  <input
                    id="server-url"
                    name="server"
                    type="url"
                    required
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="http://localhost:8090"
                    value={serverUrl()}
                    onInput={(e) => setServerUrl(e.target.value)}
                  />
                  <p class="mt-1 text-xs text-gray-500">The URL where your PocketBase instance is hosted</p>
                </div>

                <div>
                  <label for="email-address" class="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="admin@example.com"
                    value={email()}
                    onInput={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">
                    Admin Password
                  </label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="password"
                      name="password"
                      type={showPassword() ? "text" : "password"}
                      autocomplete="current-password"
                      required
                      class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Password"
                      value={password()}
                      onInput={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword())}
                    >
                      {showPassword() ? (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error() && (
                <div class="bg-red-50 border-l-4 border-red-400 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-red-700">{error()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading()}
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isLoading() ? (
                    <>
                      <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Connecting...
                    </>
                  ) : (
                    "Connect to PocketBase"
                  )}
                </button>
              </div>
            </form>
            <textarea value={loggin()} >

            </textarea>

            <div class="mt-4 text-sm text-gray-600">
              <p class="text-center">Don't have a PocketBase instance?</p>
              <p class="text-center mt-1">
                <a href="https://pocketbase.io/docs/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-500">
                  Learn how to set one up
                </a>
              </p>
            </div>
          </div>
        </div>
      }

    </>
  )

}
