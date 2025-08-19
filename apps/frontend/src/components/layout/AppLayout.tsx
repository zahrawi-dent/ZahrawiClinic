import { type Component, createMemo, Show } from 'solid-js';
import { Sidebar, defaultNavItems } from '../Sidebar';
import { authStore } from '../../auth/auth-store';


export const AppSidebar: Component = () => {
  const { authState } = authStore

  const userProfile = createMemo(() => {
    if (!authState.user) return undefined;
    const user = authState.user;

    return {
      name: user.name || user.email,
      email: user.email,
      avatar: user.avatar,
      role: authState.role === 'admin' ? 'Administrator' : 'User'
    };
  });

  return (
    <Show when={authState.isAuthenticated && authState.user}>
      <div class="flex flex-col h-full">
        <Sidebar
          items={defaultNavItems}
          userProfile={userProfile()}
        />
      </div>
    </Show>
  );
};
