// PatientListItem.tsx
import { Link } from '@tanstack/solid-router'
import { JSX } from 'solid-js'
import { Patient } from 'src/types/dental';


export default function PatientListItem(props: { patient: Patient }): JSX.Element {
  return (
    <li>
      <Link to={`/patients/${props.patient.id}`} class="block hover:bg-gray-50">
        <div class="px-6 py-4 flex items-center">
          <div class="min-w-0 flex-1 flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
                {props.patient.firstName?.[0]?.toUpperCase() || ''}
                {props.patient.lastName?.[0]?.toUpperCase() || ''}
              </div>
            </div>
            <div class="min-w-0 flex-1 px-4">
              <div>
                <p class="text-sm font-medium text-indigo-600 truncate">
                  {props.patient.firstName} {props.patient.lastName}
                </p>
                <p class="mt-1 flex items-center text-sm text-gray-500">
                  <span class="truncate">{props.patient.email}</span>
                </p>
              </div>
            </div>
            <div class="hidden md:block">
              <div>
                <p class="text-sm text-gray-900">{props.patient.phone}</p>
                <p class="mt-1 text-sm text-gray-500">
                  {/* TODO: get last visit from last appointment */}
                  Last Visit:{' '}
                  {props.patient.updatedAt
                    ? new Date(props.patient.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div class="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </Link>
    </li>
  );
}
