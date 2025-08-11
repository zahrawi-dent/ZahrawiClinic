import type { Component } from 'solid-js';
import { OrganizationsComponent } from '../components/OrganizationsComponent';

const Dashboard: Component = () => {
  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-semibold">Dashboard</h2>
        <p class="text-sm text-gray-600">Quick overview and shortcuts.</p>
      </div>
      <OrganizationsComponent />
    </div>
  );
};

export default Dashboard;


