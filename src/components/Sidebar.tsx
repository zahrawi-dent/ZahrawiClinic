// Sidebar.jsx
import { For } from 'solid-js';
import { A } from '@solidjs/router'; // A component handles active state

const Sidebar = (props: any) => {
  const menuItems = [
    // Use end: true for the root path to avoid it matching every other path
    { path: '/', label: 'Dashboard', icon: 'home', end: true },
    { path: '/patients', label: 'Patients', icon: 'users' },
    { path: '/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/treatments', label: 'Treatments', icon: 'clipboard' },
    { path: '/billing', label: 'Billing', icon: 'credit-card' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];


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
              icon={item.icon}
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

function NavItem(props: any) {
  return (
    <A
      href={props.href}
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
        {/* Added w-5 and text-center for consistent icon alignment */}
        <span class="mr-2 w-5 text-center">
          <i class={`fas fa-${props.icon}`}></i>
        </span>
        {props.label}
      </div>
    </A>
  );
}
