import { JSX } from 'solid-js';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card(props: CardProps) {
  return (
    <div class={`bg-white rounded-lg shadow ${props.class || ''}`}>
      {(props.title || props.subtitle) && (
        <div class="px-6 py-4 border-b border-gray-200">
          {props.title && <h3 class="text-lg font-medium text-gray-900">{props.title}</h3>}
          {props.subtitle && <p class="mt-1 text-sm text-gray-500">{props.subtitle}</p>}
        </div>
      )}
      <div class="p-6">{props.children}</div>
    </div>
  );
} 