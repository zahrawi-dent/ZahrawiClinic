import { JSX } from 'solid-js'
import { Patient } from 'src/types/dental'

interface SearchResultItemProps {
  patient: Patient
  index: number
  selectedIndex: number
  onClick: (id: string) => void
  id: string // Added id prop for potential targeting
}

export default function SearchResultItem(props: SearchResultItemProps): JSX.Element {
  const isSelected = () => props.index === props.selectedIndex; // Make it a signal accessor if needed often

  return (
    // Use li element directly for semantics
    <li
      id={props.id} // Assign the ID
      // Use aria-selected for better accessibility on list items
      aria-selected={isSelected()}
      class={`block outline-none ${isSelected() ? 'bg-indigo-50' : 'hover:bg-gray-50'}`} // Added outline-none for focus styling consistency
      // Recommended to use button or link role if clickable
      role="option" // Use role="option" for listbox pattern
      onClick={() => props.onClick(props.patient.id)}
      // Add mouse enter to potentially set index? (Optional enhancement)
      // onMouseEnter={() => console.log("Maybe set index on hover?")}
      // onKeyPress removed as onClick handles Enter implicitly better with role="option" or if wrapped in button
      tabIndex={-1} // Items are not directly tabbable, navigation is via input arrows
    >
      {/* Keep inner div for padding/layout */}
      <div class="px-6 py-4 flex items-center cursor-pointer">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-sm">
              {props.patient.firstName?.[0]?.toUpperCase() || ''}
              {props.patient.lastName?.[0]?.toUpperCase() || ''}
            </div>
          </div>
          <div class="min-w-0 flex-1 px-4">
            <div>
              <p class={`text-sm font-medium ${isSelected() ? 'text-indigo-700' : 'text-indigo-600'} truncate`}>
                {props.patient.firstName} {props.patient.lastName}
              </p>
              <p class="mt-1 flex items-center text-xs text-gray-500">
                <span class="truncate">{props.patient.email || 'No email'}</span> {/* Handle missing email */}
              </p>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 hidden sm:block">{props.patient.phone || 'No phone'}</p> {/* Handle missing phone */}
          </div>
        </div>
      </div>
    </li>
  );
}
