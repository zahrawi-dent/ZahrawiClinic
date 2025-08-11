import type { Component, JSX } from 'solid-js';
import { For, Show, createMemo, createSignal, onMount } from 'solid-js';
import { Link, useLocation } from '@tanstack/solid-router';
import { Tooltip } from '@kobalte/core/tooltip';

type NavItem = {
  to: string;
  label: string;
  icon?: (props: { class?: string }) => JSX.Element;
  section?: string;
  hidden?: boolean;
};

interface SidebarProps {
  items: NavItem[];
  class?: string;
  defaultCollapsed?: boolean;
  forceExpanded?: boolean;
}

const IconDashboard: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />
  </svg>
);

const IconUsers: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M16 11a4 4 0 10-8 0 4 4 0 008 0zm-6 5a6 6 0 00-6 6h2a4 4 0 014-4h4a4 4 0 014 4h2a6 6 0 00-6-6H10z" />
  </svg>
);

const IconUsers2: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M7 12a4 4 0 110-8 4 4 0 010 8zm10 0a4 4 0 110-8 4 4 0 010 8zM2 20a5 5 0 015-5h2a5 5 0 015 5H2zm10 0a5 5 0 015-5h2a5 5 0 015 5h-12z" />
  </svg>
);

const IconCalendar: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3V2zm13 8H4v10h16V10z" />
  </svg>
);

const IconClinic: Component<{ class?: string }> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden class={props.class || 'h-5 w-5'}>
    <path fill="currentColor" d="M3 21V9l9-6 9 6v12h-6v-6H9v6H3z" />
  </svg>
);

export const Sidebar: Component<SidebarProps> = (props) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = createSignal<boolean>(props.defaultCollapsed ?? false);

  onMount(() => {
    const stored = localStorage.getItem('sidebar:collapsed');
    if (stored != null) setCollapsed(stored === '1');
  });

  const isCollapsed = createMemo(() => (props.forceExpanded ? false : collapsed()));

  const toggle = () => {
    const next = !collapsed();
    setCollapsed(next);
    localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
  };

  const isActive = (to: string) => location().pathname === to || location().pathname.startsWith(to + '/');

  const sections = createMemo(() => {
    const groups = new Map<string, NavItem[]>();
    for (const item of props.items) {
      if (item.hidden) continue;
      const key = item.section || 'main';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  });

  return (
    <div class={`h-full border-r bg-white transition-[width] duration-200 ${isCollapsed() ? 'w-16' : 'w-64'} ${props.class || ''}`}>
      <div class="flex items-center justify-between gap-2 px-2 py-3 border-b">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-bold" aria-hidden>
            ZC
          </div>
          <Show when={!isCollapsed()}>
            <span class="font-semibold">Zahrawi Clinic</span>
          </Show>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-pressed={isCollapsed()}
          onClick={toggle}
        >
          {isCollapsed() ? '›' : '‹'}
          <span class="sr-only">Toggle sidebar</span>
        </button>
      </div>

      <nav class="p-2" aria-label="Main navigation">
        <For each={sections()}>
          {([section, items]) => (
            <div class="mt-2">
              <Show when={!isCollapsed() && section !== 'main'}>
                <div class="px-2 pb-1 text-xs uppercase tracking-wide text-gray-400">{section}</div>
              </Show>
              <ul class="space-y-1">
                <For each={items}>
                  {(item) => (
                    <li>
                      <Tooltip openDelay={400} gutter={8} placement="right">
                        <Tooltip.Trigger as="div">
                          <Link
                            to={item.to}
                            aria-current={isActive(item.to) ? 'page' : undefined}
                            class={`group flex items-center gap-3 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                              ${isActive(item.to) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div class="grid place-items-center h-5 w-5 text-gray-500 group-hover:text-gray-700">
                              {item.icon ? item.icon({ class: 'h-5 w-5' }) : <span class="h-1 w-1 rounded-full bg-current" />}
                            </div>
                            <Show when={!isCollapsed()}>
                              <span class="truncate">{item.label}</span>
                            </Show>
                          </Link>
                        </Tooltip.Trigger>
                        <Show when={isCollapsed()}>
                          <Tooltip.Content class="rounded bg-gray-900 text-white px-2 py-1 text-xs shadow">
                            {item.label}
                            <Tooltip.Arrow />
                          </Tooltip.Content>
                        </Show>
                      </Tooltip>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </nav>
    </div>
  );
};

export const defaultNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/patients', label: 'Patients', icon: IconUsers },
  { to: '/appointments', label: 'Appointments', icon: IconCalendar },
  { to: '/admin/users', label: 'Users', section: 'Admin', icon: IconUsers2 },
  { to: '/admin/clinics', label: 'Clinics', section: 'Admin', icon: IconClinic },
];


