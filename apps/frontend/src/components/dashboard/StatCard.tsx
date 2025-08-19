import type { Component } from "solid-js";

export const StatCard = (props: {
  title: string;
  value: string | number;
  icon: Component;
  trend?: string;
  trendType?: 'up' | 'down';
  color?: string;
}) => (
  <div class={`rounded-lg shadow-sm border border-gray-200 p-6 ${props.color || ''}`}>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-100">{props.title}</p>
        <p class="text-2xl font-bold text-gray-200 mt-1">{props.value}</p>
        {props.trend && (
          <div class={`flex items-center mt-2 text-sm ${props.trendType === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
            <span>{props.trend}</span>
          </div>
        )}
      </div>
      <div class="text-gray-400">
        <props.icon />
      </div>
    </div>
  </div>
);
