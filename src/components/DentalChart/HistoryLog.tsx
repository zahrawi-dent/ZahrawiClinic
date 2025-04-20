// src/components/DentalChart/HistoryLog.tsx
import { Component, For, Show, Accessor } from 'solid-js';
import type { HistoryEntry } from './types/dental.types';

interface HistoryLogProps {
  historyLog: Accessor<readonly HistoryEntry[]>; // Use readonly array
}

export const HistoryLog: Component<HistoryLogProps> = (props) => {
  return (
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-3">History Log</h2>
      <div class="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto text-sm shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <Show when={props.historyLog().length > 0} fallback={<p class="italic text-gray-500">No history recorded yet.</p>}>
          <ul>
            <For each={props.historyLog()}>
              {entry => (
                <li class="mb-1.5 pb-1.5 border-b border-gray-300 last:border-b-0">
                  <span class="font-mono text-xs text-gray-500 mr-2">[{new Date(entry.timestamp).toLocaleString()}]</span>
                  <span>{entry.text}</span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
};
