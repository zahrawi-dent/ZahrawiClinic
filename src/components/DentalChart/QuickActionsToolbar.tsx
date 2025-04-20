// src/components/DentalChart/QuickActionsToolbar.tsx
import { Component, For, Accessor, Setter, Show } from 'solid-js';
import type { Condition, ConditionId } from './types/dental.types';
import { getConditionById } from './constants/conditions';

interface QuickActionsToolbarProps {
  // Pass specific condition IDs you want buttons for
  actionIds: Readonly<ConditionId[]>;
  armedCondition: Accessor<ConditionId | null>;
  onArmCondition: (conditionId: ConditionId | null) => void; // Allow null to disarm
}

export const QuickActionsToolbar: Component<QuickActionsToolbarProps> = (props) => {

  const getButtonInfo = (id: ConditionId): Condition | null => {
    return getConditionById(id) ?? null;
  }

  const handleClick = (id: ConditionId) => {
    // Toggle: If clicking the already armed button, disarm it. Otherwise, arm it.
    props.onArmCondition(props.armedCondition() === id ? null : id);
  }

  return (
    <div class="bg-gray-100 p-2 rounded shadow-md mb-4 border border-gray-200">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm font-medium text-gray-700 mr-2">Quick Actions:</span>
        <For each={props.actionIds}>
          {(id) => {
            const info = getButtonInfo(id);
            if (!info) return null; // Skip if condition ID is invalid

            const isArmed = () => props.armedCondition() === id;

            return (
              <button
                title={`Arm Quick Action: ${info.name}`}
                onClick={() => handleClick(id)}
                class={`px-2 py-1 text-xs rounded border transition-colors duration-150
                                        ${isArmed() ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
              >
                {info.abbr} ({info.name})
              </button>
            )
          }}
        </For>
        {/* Optional: Button to clear armed condition */}
        <Show when={props.armedCondition() !== null}>
          <button
            title="Disarm Quick Action (Esc)"
            onClick={() => props.onArmCondition(null)}
            class="px-1 py-0.5 text-xs rounded border border-gray-400 bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            Clear
          </button>
        </Show>
      </div>
    </div>
  );
};
