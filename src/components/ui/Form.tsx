import { JSX } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input(props: InputProps) {
  return (
    <div class="mb-4">
      <label for={props.id} class="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <input
        {...props}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${props.error ? 'border-red-300' : ''
          } ${props.class || ''}`}
      />
      {props.error && <p class="mt-1 text-sm text-red-600">{props.error}</p>}
    </div>
  );
}

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select(props: SelectProps) {
  return (
    <div class="mb-4">
      <label for={props.id} class="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <select
        {...props}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${props.error ? 'border-red-300' : ''
          } ${props.class || ''}`}
      >
        {props.options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
      {props.error && <p class="mt-1 text-sm text-red-600">{props.error}</p>}
    </div>
  );
}

interface TextAreaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea(props: TextAreaProps) {
  return (
    <div class="mb-4">
      <label for={props.id} class="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <textarea
        {...props}
        rows={props.rows || 3}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${props.error ? 'border-red-300' : ''
          } ${props.class || ''}`}
      />
      {props.error && <p class="mt-1 text-sm text-red-600">{props.error}</p>}
    </div>
  );
}

interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> { }

export function Form(props: FormProps) {
  return (
    <form {...props} class={`space-y-6 ${props.class || ''}`}>
      {props.children}
    </form>
  );
} 
