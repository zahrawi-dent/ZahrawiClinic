import { createSignal, onMount, For, JSX } from 'solid-js'
import { mockApi } from '../mockApi'
import { Invoice } from '../types'
import { A } from '@solidjs/router'

export default function Billing(): JSX.Element {
  const [invoices, setInvoices] = createSignal<Invoice[]>([])
  const [filterStatus, setFilterStatus] = createSignal('all')

  onMount(async () => {
    // In a real app, this would be a real API call
    // const data = [
    //   { id: 1001, patient: 'John Smith', date: '2023-12-01', amount: 350, status: 'Paid', description: 'Root Canal' },
    //   { id: 1002, patient: 'Sarah Johnson', date: '2023-12-02', amount: 120, status: 'Paid', description: 'Regular Cleaning' },
    //   { id: 1003, patient: 'Michael Brown', date: '2023-12-03', amount: 450, status: 'Pending', description: 'Crown Placement' },
    //   { id: 1004, patient: 'Emily Wilson', date: '2023-12-04', amount: 85, status: 'Pending', description: 'Consultation' },
    //   { id: 1005, patient: 'David Lee', date: '2023-12-05', amount: 275, status: 'Overdue', description: 'Filling' }
    // ];

    const invoices = await mockApi.getAllInvoices()
    setInvoices(invoices)
  })

  const filteredInvoices = (): Invoice[] => {
    if (filterStatus() === 'all') {
      return invoices()
    }
    return invoices().filter((invoice) => invoice.status.toLowerCase() === filterStatus())
  }

  const totalAmount = (): string => {
    return filteredInvoices()
      .reduce((total, invoice) => total + invoice.amount, 0)
      .toFixed(2)
  }

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Billing & Invoices</h1>
        <A
          href="/create-invoice"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Create New Invoice
        </A>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500 mb-1">Total Outstanding</p>
          <p class="text-2xl font-bold text-gray-900">$725.00</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500 mb-1">Paid This Month</p>
          <p class="text-2xl font-bold text-gray-900">$1,240.00</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-500 mb-1">Overdue Invoices</p>
          <p class="text-2xl font-bold text-gray-900">1</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status"
              value={filterStatus()}
              onChange={(e) => setFilterStatus(e.target.value)}
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-700">Showing {filteredInvoices().length} invoices</p>
            <p class="text-sm font-medium text-gray-900">Total: ${totalAmount()}</p>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Invoice #
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <For each={filteredInvoices()}>
              {(invoice) => (
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{invoice.id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* {invoice.patient} */}
                    Patient name...
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.description}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button class="text-indigo-600 hover:text-indigo-900">Print</button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
