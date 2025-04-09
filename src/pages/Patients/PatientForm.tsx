import { createMemo, createSignal, JSX } from 'solid-js'
import { Patient } from 'src/types/dental'

type ErrorState = {
  email?: string
  phone?: string
  general?: string
}

export default function PatientForm(props: {
  onSubmit: (patient: Patient, onError: (error: any) => void) => void
  patient?: Patient
}): JSX.Element {
  const initialData = props.patient || {
    firstName: '',
    lastName: '',
    age: 0,
    sex: '',
    phone: '',
    email: '',
    address: '',
    medicalHistory: '',
    insuranceProvider: '',
    allergies: '',
    notes: ''
  }

  const [form, setForm] = createSignal({ ...initialData })
  const [errors, setErrors] = createSignal<ErrorState>({})
  const isEditMode = createMemo(() => !!props.patient)

  const handleSubmit = (e: Event): void => {
    e.preventDefault()
    // Clear previous errors
    setErrors({})

    const formData = form()

    // If in edit mode, use the existing ID, otherwise generate a new one

    // const patientData = isEditMode() ? formData : { ...formData, id: Date.now().toString() }
    const patientData = formData


    // Pass the form data and an error handler to the onSubmit function
    props.onSubmit(patientData, handleSubmitError)
  }

  const handleSubmitError = (error: any): void => {
    // Check error message to determine what constraint was violated
    const errorMsg = error.message || String(error)

    if (
      errorMsg.includes('UNIQUE constraint failed') ||
      errorMsg.includes('constraint violation')
    ) {
      if (errorMsg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: 'This email is already registered' }))
      }
      if (errorMsg.toLowerCase().includes('phone')) {
        setErrors((prev) => ({ ...prev, phone: 'This phone number is already registered' }))
      }
      // If we can't determine which field caused the error
      if (!errorMsg.toLowerCase().includes('email') && !errorMsg.toLowerCase().includes('phone')) {
        setErrors((prev) => ({ ...prev, general: 'A record with this information already exists' }))
      }
    } else {
      // General error handling
      setErrors((prev) => ({ ...prev, general: 'An error occurred while saving data' }))
    }
  }

  const handleChange =
    (field: string) =>
      (e: Event): void => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

        // Clear error for this field when user starts typing
        if (field === 'email' || field === 'phone' || field === 'general') {
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (field in newErrors) {
              delete newErrors[field as keyof ErrorState]
            }
            return newErrors
          })
        }

        setForm({
          ...form(),
          [field]: target.value
        })
      }

  return (
    <form onSubmit={handleSubmit} class="bg-white shadow-md rounded p-6">
      {errors().general && (
        <div class="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
          {errors().general}
        </div>
      )}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">First Name</label>
          <input
            type="text"
            value={form().firstName}
            onInput={handleChange('firstName')}
            required
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Last Name</label>
          <input
            type="text"
            value={form().lastName}
            onInput={handleChange('lastName')}
            required
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Age</label>
          <input
            type="number"
            value={form().age || ''}
            onInput={handleChange('age')}
            required
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Sex</label>
          <select
            value={form().sex}
            onInput={handleChange('sex')}
            required
            class="w-full p-2 border rounded"
          >
            <option value="">Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Phone</label>
          <input
            type="tel"
            value={form().phone}
            onInput={handleChange('phone')}
            required
            class={`w-full p-2 border rounded ${errors().phone ? 'border-red-500' : ''}`}
          />
          {errors().phone && <p class="text-red-500 text-sm mt-1">{errors().phone}</p>}
        </div>

        <div>
          <label class="block mb-1">Email</label>
          <input
            type="email"
            value={form().email}
            onInput={handleChange('email')}
            class={`w-full p-2 border rounded ${errors().email ? 'border-red-500' : ''}`}
          />
          {errors().email && <p class="text-red-500 text-sm mt-1">{errors().email}</p>}
        </div>
      </div>

      <div class="mt-4">
        <label class="block mb-1">Address</label>
        <textarea
          value={form().address}
          onInput={handleChange('address')}
          class="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      <div class="mt-4">
        <label class="block mb-1">Medical History</label>
        <textarea
          value={form().medicalHistory}
          onInput={handleChange('medicalHistory')}
          class="w-full p-2 border rounded"
          rows="3"
        />
      </div>

      <div class="mt-4">
        <label class="block mb-1">Insurance Provider</label>
        <input
          type="text"
          value={form().insuranceProvider}
          onInput={handleChange('insuranceProvider')}
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="mt-4">
        <label class="block mb-1">Allergies</label>
        <textarea
          value={form().allergies}
          onInput={handleChange('allergies')}
          class="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      <div class="mt-4">
        <label class="block mb-1">Notes</label>
        <textarea
          value={form().notes}
          onInput={handleChange('notes')}
          class="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      <div class="mt-6">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {isEditMode() ? 'Update Patient' : 'Register Patient'}
        </button>
      </div>
    </form>
  )
}
