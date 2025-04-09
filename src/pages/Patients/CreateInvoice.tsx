// pages/CreateInvoice.jsx
import BackButton from '../../components/BackButton'
import { createSignal, createResource, For, JSX, createEffect } from 'solid-js'

function CreateInvoice(): JSX.Element {
  // In a real app, you would fetch these from your database
  const fetchPatients = async (): Promise<
    { id: string; firstName: string; lastName: string }[]
  > => {
    // Mock data for example
    return [
      { id: '1', firstName: 'John', lastName: 'Doe' },
      { id: '2', firstName: 'Jane', lastName: 'Smith' }
    ]
  }

  const [patients] = createResource(fetchPatients)

  const handleCreateInvoice = (invoice): void => {
    // In a real app, you would save to a database
    console.log('Invoice created:', invoice)
    // Redirect or show confirmation
  }

  return (
    <div class="max-w-4xl mx-auto">
      {/* TODO: make better layout for Backbutton */}
      <BackButton to="/" label="Back to Dashboard" />
      <h2 class="text-2xl font-bold my-6"> Create Invoice</h2>
      <InvoiceForm patients={patients()} onSubmit={handleCreateInvoice} />
    </div>
  )
}

function InvoiceForm(props): JSX.Element {
  const [items, setItems] = createSignal([{ description: '', price: '', quantity: 1 }])
  const [form, setForm] = createSignal({
    patientId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethod: '',
    notes: ''
  })

  const [total, setTotal] = createSignal(0)

  createEffect(() => {
    const newTotal = items().reduce((sum, item) => {
      return sum + parseFloat(item.price || 0) * parseInt(item.quantity || 0)
    }, 0)
    setTotal(newTotal)
  })

  const handleSubmit = (e): void => {
    e.preventDefault()
    props.onSubmit({
      ...form(),
      items: items(),
      total: total(),
      id: 'INV-' + Date.now().toString().slice(-6) // Simple invoice number generation
    })

    // Reset form
    setForm({
      patientId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentMethod: '',
      notes: ''
    })
    setItems([{ description: '', price: '', quantity: 1 }])
  }

  const handleChange =
    (field) =>
      (e): void => {
        setForm({
          ...form(),
          [field]: e.target.value
        })
      }

  const addItem = (): void => {
    setItems([...items(), { description: '', price: '', quantity: 1 }])
  }

  const removeItem = (index): void => {
    setItems(items().filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value): void => {
    setItems(
      items().map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  return (
    <form onSubmit={handleSubmit} class="bg-white shadow-md rounded p-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Patient</label>
          <select
            value={form().patientId}
            onInput={handleChange('patientId')}
            required
            class="w-full p-2 border rounded"
          >
            <option value="">Select Patient</option>
            {
              <For each={props.patients}>
                {(patient) => (
                  <option value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                )}
              </For>
            }
          </select>
        </div>

        <div>
          <label class="block mb-1">Payment Method</label>
          <select
            value={form().paymentMethod}
            onInput={handleChange('paymentMethod')}
            class="w-full p-2 border rounded"
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit Card</option>
            <option value="insurance">Insurance</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Invoice Date</label>
          <input
            type="date"
            value={form().invoiceDate}
            onInput={handleChange('invoiceDate')}
            required
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Due Date</label>
          <input
            type="date"
            value={form().dueDate}
            onInput={handleChange('dueDate')}
            class="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Invoice Items</h3>

        {/* TODO: use For */}
        {items().map((item, index) => (
          <div class="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onInput={(e) => updateItem(index, 'description', e.target.value)}
              required
              class="flex-grow p-2 border rounded"
            />

            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onInput={(e) => updateItem(index, 'price', e.target.value)}
              required
              min="0"
              step="0.01"
              class="w-24 p-2 border rounded"
            />

            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onInput={(e) => updateItem(index, 'quantity', e.target.value)}
              required
              min="1"
              class="w-16 p-2 border rounded"
            />

            {index > 0 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                class="p-2 text-red-600 hover:bg-red-100 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          class="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Add Item
        </button>
      </div>

      <div class="mt-4 text-right">
        <span class="font-bold">Total: ${total().toFixed(2)}</span>
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
          Create Invoice
        </button>
      </div>
    </form>
  )
}

export default CreateInvoice
