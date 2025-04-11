import { createFileRoute, Link } from '@tanstack/solid-router'

export const Route = createFileRoute('/nav')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Sidebar isOpen={true} />
}
// src/components/Sidebar.jsx

function Sidebar({ isOpen }) {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: "home" },
    { name: "Patients", path: "/patients", icon: "users" },
    { name: "Appointments", path: "/appointments", icon: "calendar" },
    { name: "Billing", path: "/billing", icon: "credit-card" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  const renderIcon = (iconName) => {
    const icons = {
      home: (
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      users: (
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      calendar: (
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      "credit-card": (
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      settings: (
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };

    return icons[iconName] || null;
  };

  return (
    <div
      class={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"
        } min-h-screen z-20`}
    >
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-center h-16 px-4">
          <div class={`${isOpen ? "block" : "hidden"} text-xl font-bold`}>
            DentalManager
          </div>
          <div class={`${isOpen ? "hidden" : "block"} text-xl font-bold`}>
            DM
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <nav class="px-2 py-4">
            <ul class="space-y-1">
              {menuItems.map((item) => (
                <li>
                  <Link
                    to={item.path}
                    class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                    activeClass="bg-gray-900 text-white"
                  >
                    <span class="mr-3">{renderIcon(item.icon)}</span>
                    <span class={`${isOpen ? "block" : "hidden"}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div class="p-4 border-t border-gray-700">
          <button
            class="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
            onClick={() => {
              // Handle logout
              localStorage.removeItem('pocketbaseUrl');
              window.location.reload();
            }}
          >
            <svg
              class="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class={`${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
