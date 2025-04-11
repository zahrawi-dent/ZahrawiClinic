// Sidebar.jsx
import { For, JSX } from 'solid-js';
import { Link } from '@tanstack/solid-router';

const Sidebar = (props: { logout: () => void }) => {
  const menuItems = [
    // Use end: true for the root path to avoid it matching every other path
    { path: '/', label: 'Dashboard', icon: 'home', end: true },
    { path: '/patients', label: 'Patients', icon: 'users' },
    { path: '/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/billing', label: 'Billing', icon: 'credit-card' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const renderIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
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
    // Added flex flex-col to make nav scrollable if needed
    <div class="bg-indigo-800 text-white w-64 flex-shrink-0 flex flex-col h-screen">
      {/* Header section - Added flex-shrink-0 */}
      <div class="flex items-center space-x-2 p-4 mb-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2v-8" />
        </svg>
        <div class="flex flex-col">
          <div class="text-2xl font-bold">DentaCare Pro</div>
          <div class="text-indigo-200 text-sm">Dental Management System</div>
        </div>
      </div>

      {/* Removed redundant div wrapper */}
      {/* Navigation - Added flex-grow and overflow-y-auto */}
      <nav class="mt-8 flex-grow overflow-y-auto">
        <For each={menuItems}>
          {(item) => (
            <NavItem
              href={item.path}
              label={item.label}
              icon={renderIcon(item.icon)}
              // Pass the 'end' prop down if it exists
              end={item.end}
            />
          )}
        </For>
        {/* Logout Button - consider adding an icon too */}
        <button
          onClick={props.logout}
          class="flex items-center w-full px-4 py-3 mt-4 text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors"
        >
          <span class="mr-2 w-5 text-center"> {/* Added for alignment like NavItem */}
            <i class="fas fa-sign-out-alt"></i> {/* Example Logout Icon */}
          </span>
          <span>Logout</span> {/* Removed extra ml-2 */}
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

function NavItem(props: {
  href: string;
  label: string;
  icon: JSX.Element;
  end?: boolean;
}) {
  return (
    <Link
      to={props.href}
      // Base classes
      class="flex items-center px-4 py-3 text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors"
      // --- MARKER: Active Class ---
      // This class will be added when the link's href matches the current route
      activeClass="bg-indigo-900 text-white font-semibold" // Added font-semibold for extra emphasis
      // Use the 'end' prop to ensure exact match (especially needed for '/')
      // Defaults to false if not provided
      end={props.end}
    >
      <div class="flex items-center">
        <span class="mr-3">{props.icon}</span>
        {props.label}
      </div>
    </Link>
  );
}
