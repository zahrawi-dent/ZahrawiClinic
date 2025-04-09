// Header.jsx
import { A } from '@solidjs/router';
import { createSignal } from 'solid-js';

const Header = (props: any) => {
  const [dropdownOpen, setDropdownOpen] = createSignal(false);

  return (
    <div class="flex items-center">
      <div class="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen())}
          class="flex items-center relative z-10 text-gray-700 focus:outline-none"
        >
          <span class="mx-2 font-medium sm:block">{props.name}</span>
          <img
            class="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover"
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User avatar"
          />
        </button>

        <div
          class={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ${dropdownOpen() ? 'block' : 'hidden'
            }`}
        >
          <A href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white">Profile</A>
          <A href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white">settings</A>
          <A href="/login" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white">Logout</A>
        </div>
      </div>
    </div>
  );
};

export default Header;
