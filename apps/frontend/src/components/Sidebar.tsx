import {
  createSignal,
  createEffect,
  For,
  Show,
  onMount,
  onCleanup,
  type Component,
  type JSXElement,
  createMemo,
  Match,
  Switch
} from "solid-js";
import { isServer } from "solid-js/web";
import { useNavigate, useLocation, Link } from "@tanstack/solid-router";
import SearchModal from "./SearchModal";
import { useAuth } from "../auth/AuthContext";

type userRole = "receptionist" | "dentist" | "manager" | "admin" | "user" | null;

// ===== TYPES =====
export type NavItem = {
  to: string;
  label: string;
  icon?: Component<{ class?: string }>;
  section?: string;
  hidden?: boolean;
  badge?: string | number;
  children?: NavItem[];
};

interface SidebarProps {
  items: NavItem[];
  class?: string;
  defaultCollapsed?: boolean;
  userProfile?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: userRole;
  };
  onCollapse?: (collapsed: boolean) => void;
}

// ===== ICONS =====
const SearchIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ZahrawiIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-5 5v-5zM4.83 2.83A4 4 0 016.34 2h11.32a4 4 0 013.51 2.83L22 8H2l1.83-5.17z" />
  </svg>
);

const HelpIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ===== COMPONENTS =====
const Kbd = (props: { children: any; class?: string }) => (
  <kbd
    class={`inline-flex items-center justify-center rounded border border-slate-600/50 bg-slate-900/80 px-1.5 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm ${props.class ?? ""}`}
  >
    {props.children}
  </kbd>
);

const UserProfileDropdown = (props: {
  userProfile: { id: string, name: string; email: string; avatar?: string; role: userRole };
  collapsed: boolean
}) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  console.log('User profile:', props.userProfile.role);

  const handleLogout = async () => {
    // TODO: Implement sign out logic
    await logout();
    navigate({ to: '/login' });
  };

  const handleSettings = () => {
    // TODO: Navigate to settings
    console.log('Settings clicked');
    setIsOpen(false);
  };

  const handleProfile = () => {
    // TODO: Navigate to profile
    console.log('Profile clicked');
    setIsOpen(false);
  };

  const handleNotifications = () => {
    // TODO: Navigate to notifications
    console.log('Notifications clicked');
    setIsOpen(false);
  };

  const handleHelp = () => {
    // TODO: Navigate to help
    console.log('Help clicked');
    setIsOpen(false);
  };

  return (
    <div class="relative">
      <Show when={!props.collapsed}>
        <button
          onClick={() => setIsOpen(!isOpen())}
          class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors group"
        >
          <div class="relative">
            <Show
              when={props.userProfile.avatar}
              fallback={
                <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-white">
                    {props.userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              }
            >
              <img
                // TODO: get pocketbase instance instead of hardcoding it
                src={`http://127.0.0.1:8090/api/files/users/${props.userProfile.id}/${props.userProfile.avatar}`}
                alt={props.userProfile.name}
                class="w-10 h-10 rounded-full object-cover"
              />
            </Show>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
          </div>

          <div class="flex-1 min-w-0 text-left">
            <p class="font-medium text-white truncate">{props.userProfile.name}</p>
            <p class="text-sm text-slate-400 truncate">{props.userProfile.role}</p>
          </div>

          <div class={`transition-transform duration-200 ${isOpen() ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </button>

        {/* Dropdown Menu */}
        <Show when={isOpen()}>
          <div class="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
            <div class="p-2 space-y-1">
              <button
                onClick={handleProfile}
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-md transition-colors"
              >
                <UserIcon />
                <span>Profile</span>
              </button>

              <button
                onClick={handleSettings}
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-md transition-colors"
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>

              <button
                onClick={handleNotifications}
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-md transition-colors"
              >
                <BellIcon />
                <span>Notifications</span>
              </button>

              <button
                onClick={handleHelp}
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-md transition-colors"
              >
                <HelpIcon />
                <span>Help & Support</span>
              </button>

              <div class="border-t border-slate-700/50 my-1"></div>

              <button
                onClick={handleLogout}
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors"
              >
                <LogoutIcon />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </Show>
      </Show>

      <Show when={props.collapsed}>
        <div class="flex justify-center">
          <div class="relative">
            <Show
              when={props.userProfile.avatar}
              fallback={
                <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-white">
                    {props.userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              }
            >
              <img
                src={props.userProfile.avatar}
                alt={props.userProfile.name}
                class="w-10 h-10 rounded-full object-cover"
              />
            </Show>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
          </div>
        </div>
      </Show>
    </div>
  );
};

const Badge = (props: { children: any; variant?: 'default' | 'success' | 'warning' | 'error' }) => (
  <span
    class={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-xs font-medium rounded-full ${props.variant === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
      props.variant === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
        props.variant === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-slate-600/30 text-slate-300 border border-slate-600/50'
      }`}
  >
    {props.children}
  </span>
);

const NavSection = (props: { title?: string; children: JSXElement; collapsed: boolean }) => (
  <div class="space-y-1">
    <Show when={props.title && !props.collapsed}>
      <div class="px-3 py-2">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {props.title}
        </h3>
      </div>
    </Show>
    {props.children}
  </div>
);

const NavItemComponent = (props: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const hasChildren = () => props.item.children && props.item.children.length > 0;

  const toggleExpanded = (e: Event) => {
    if (hasChildren()) {
      e.preventDefault();
      setIsExpanded(!isExpanded());
    }
  };

  return (
    <div class="space-y-1">
      <Link
        to={props.item.to}
        class={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${props.isActive
          ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 shadow-lg shadow-teal-500/10 border border-teal-500/30'
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
          } ${props.collapsed ? 'justify-center' : ''}`}
        onClick={(e) => {
          toggleExpanded(e);
          props.onClick?.();
        }}
      >
        <Show when={props.item.icon}>
          {(() => {
            const IconComponent = props.item.icon!;
            return <IconComponent class={`h-5 w-5 shrink-0 transition-colors duration-200 ${props.isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-white'
              }`} />;
          })()}
        </Show>

        <Show when={!props.collapsed}>
          <span class="flex-1 truncate">{props.item.label}</span>

          <div class="flex items-center gap-2">
            <Show when={props.item.badge}>
              <Badge>{props.item.badge}</Badge>
            </Show>

            <Show when={hasChildren()}>
              <div class={`transition-transform duration-200 ${isExpanded() ? 'rotate-90' : ''}`}>
                <ChevronRightIcon />
              </div>
            </Show>
          </div>
        </Show>

        <Show when={props.collapsed && props.item.badge}>
          <div class="absolute -top-1 -right-1">
            <Badge>{props.item.badge}</Badge>
          </div>
        </Show>
      </Link>

      <Show when={hasChildren() && isExpanded() && !props.collapsed}>
        <div class="ml-6 space-y-1 border-l border-slate-700/50 pl-4">
          <For each={props.item.children}>
            {(child) => (
              <NavItemComponent
                item={child}
                isActive={false}
                collapsed={false}
                onClick={props.onClick}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export function Sidebar(props: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [isCollapsed, setIsCollapsed] = createSignal(props.defaultCollapsed ?? false);

  // Group items by section
  const groupedItems = createMemo(() => {
    const groups: Record<string, NavItem[]> = {};

    props.items.forEach(item => {
      if (item.hidden) return;
      const section = item.section || 'main';
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });

    return groups;
  });

  // Check if current path matches nav item
  const isActiveNavItem = createMemo(() => (itemPath: string) => {
    const currentPath = location().pathname;
    return currentPath === itemPath ||
      (itemPath !== '/' && currentPath.startsWith(itemPath));
  });

  // ===== EVENT HANDLERS =====
  onMount(() => {
    if (!isServer) {
      document.addEventListener("keydown", handleKeyDown);
    }
  });

  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "/" && !isSearchOpen() &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")) {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    if (e.key === "Escape" && isMobileMenuOpen()) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      return;
    }
  };

  const toggleSearch = () => setIsSearchOpen(prev => !prev);

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen();
    setIsMobileMenuOpen(nextState);
    if (!isServer) {
      document.body.style.overflow = nextState ? "hidden" : "";
    }
  };

  const toggleCollapsed = () => {
    const newState = !isCollapsed();
    setIsCollapsed(newState);
    props.onCollapse?.(newState);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen()) {
      setIsMobileMenuOpen(false);
    }
  };

  // ===== RENDER =====
  return (
    <>
      {/* Mobile Header */}
      <header class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-xl p-4 lg:hidden">
        <Link to="/" class="flex items-center gap-3">
          <div class="text-teal-400">
            <ZahrawiIcon />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Zahrawi
          </span>
        </Link>

        <div class="flex items-center gap-2">
          <button
            onClick={toggleSearch}
            class="rounded-lg p-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
            aria-label="Open Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleMobileMenu}
            class="rounded-lg p-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            <Switch>
              <Match when={isMobileMenuOpen()}>
                <CloseIcon />
              </Match>
              <Match when={!isMobileMenuOpen()}>
                <MenuIcon />
              </Match>
            </Switch>
          </button>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen()} onClose={() => setIsSearchOpen(false)} />

      {/* Sidebar */}
      <div class="flex flex-col pt-16 lg:flex-row lg:pt-0">
        <aside
          class={`fixed inset-y-0 left-0 z-30 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 text-slate-300 transition-all duration-300 ease-in-out lg:sticky lg:translate-x-0 flex h-screen flex-col lg:h-auto lg:max-h-screen ${isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
            } ${isMobileMenuOpen() ? "mt-16 lg:mt-0" : "mt-16 lg:mt-0"
            } ${isCollapsed() ? "w-16" : "w-64"
            }`}
        >
          {/* Desktop Header */}
          <div class={`hidden shrink-0 items-center justify-between border-b border-slate-800/50 p-4 lg:flex ${isCollapsed() ? 'px-3' : ''
            }`}>
            <Show when={!isCollapsed()}>
              <Link to="/" class="flex items-center gap-3">
                <div class="text-teal-400">
                  <ZahrawiIcon />
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Zahrawi
                </span>
              </Link>
            </Show>

            <Show when={isCollapsed()}>
              <Link to="/" class="text-teal-400 mx-auto">
                <ZahrawiIcon />
              </Link>
            </Show>

            <div class={`flex items-center gap-2 ${isCollapsed() ? 'hidden' : ''}`}>
              <button
                onClick={toggleSearch}
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <Kbd aria-hidden="true">/</Kbd>
            </div>

            <button
              onClick={toggleCollapsed}
              class="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
              aria-label={isCollapsed() ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Switch>
                <Match when={isCollapsed()}>
                  <ChevronRightIcon />
                </Match>
                <Match when={!isCollapsed()}>
                  <ChevronLeftIcon />
                </Match>
              </Switch>
            </button>
          </div>

          {/* Navigation */}
          <nav class={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700/50 ${isCollapsed() ? 'p-2' : 'p-4'
            }`}>
            <div class="space-y-6">
              <For each={Object.entries(groupedItems())}>
                {([section, items]) => (
                  <NavSection
                    title={section !== 'main' ? section : undefined}
                    collapsed={isCollapsed()}
                  >
                    <div class="space-y-1">
                      <For each={items}>
                        {(item) => (
                          <NavItemComponent
                            item={item}
                            isActive={isActiveNavItem()(item.to)}
                            collapsed={isCollapsed()}
                            onClick={closeMobileMenu}
                          />
                        )}
                      </For>
                    </div>
                  </NavSection>
                )}
              </For>
            </div>
          </nav>

          {/* User Profile Footer */}
          <Show when={props.userProfile}>
            <div class={`shrink-0 border-t border-slate-800/50 ${isCollapsed() ? 'p-2' : 'p-4'}`}>
              <UserProfileDropdown
                userProfile={props.userProfile!}
                collapsed={isCollapsed()}
              />
            </div>
          </Show>
        </aside>

        {/* Mobile Overlay */}
        <Show when={isMobileMenuOpen()}>
          <div
            class="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
        </Show>
      </div>
    </>
  );
}

// ===== DEFAULT ICONS =====
export const IconDashboard: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />
  </svg>
);

export const IconUsers: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M16 11a4 4 0 10-8 0 4 4 0 008 0zm-6 5a6 6 0 00-6 6h2a4 4 0 014-4h4a4 4 0 014 4h2a6 6 0 00-6-6H10z" />
  </svg>
);

export const IconUsers2: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M7 12a4 4 0 110-8 4 4 0 010 8zm10 0a4 4 0 110-8 4 4 0 010 8zM2 20a5 5 0 015-5h2a5 5 0 015 5H2zm10 0a5 5 0 015-5h2a5 5 0 015 5h-12z" />
  </svg>
);

export const IconCalendar: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3V2zm13 8H4v10h16V10z" />
  </svg>
);

export const IconClinic: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M3 21V9l9-6 9 6v12h-6v-6H9v6H3z" />
  </svg>
);

// ===== DEFAULT NAV ITEMS =====
export const defaultNavItems: NavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    icon: IconDashboard,
    badge: '2'
  },
  {
    to: '/patients',
    label: 'Patients',
    icon: IconUsers,
    badge: '12'
  },
  {
    to: '/appointments',
    label: 'Appointments',
    icon: IconCalendar,
    badge: '3'
  },
  {
    to: '/admin/users',
    label: 'Users',
    section: 'Administration',
    icon: IconUsers2
  },
  {
    to: '/admin/clinics',
    label: 'Clinics',
    section: 'Administration',
    icon: IconClinic
  },
];
