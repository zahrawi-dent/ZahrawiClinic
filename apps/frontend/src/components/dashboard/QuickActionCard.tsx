import type { Component } from "solid-js";

export const QuickActionCard = (props: {
  title: string;
  description: string;
  icon: Component;
  onClick: () => void;
  color?: string;
}) => (
  <button
    onClick={props.onClick}
    class={`w-full rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow ${props.color || ''}`}
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-100">{props.title}</h3>
        <p class="text-sm text-gray-200 mt-1">{props.description}</p>
      </div>
      <div class="text-gray-300">
        <props.icon />
      </div>
    </div>
  </button>
);
