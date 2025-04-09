import { createSignal, createEffect, For, JSX } from 'solid-js'

function Calendar(props): JSX.Element {
  const [currentDate, setCurrentDate] = createSignal(props.selectedDate || new Date())
  const [dailyView, setDailyView] = createSignal(true)
  const [dailyAppointments, setDailyAppointments] = createSignal([])

  // Time slots from 8:00 AM to 5:00 PM
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  createEffect(() => {
    // Update parent component when date changes
    props.onDateChange?.(currentDate())

    // Filter appointments for the selected date
    if (props.appointments) {
      const date = currentDate().toISOString().split('T')[0]
      const filtered = props.appointments.filter((apt) => {
        return apt.start.startsWith(date)
      })
      setDailyAppointments(filtered)
    }
  })

  const formatDate = (date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const goToNextDay = (): void => {
    const next = new Date(currentDate())
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const goToPrevDay = (): void => {
    const prev = new Date(currentDate())
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const getAppointmentForTimeSlot = (timeSlot) => {
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const slotTime = new Date(currentDate())
    slotTime.setHours(hours, minutes, 0, 0)

    return dailyAppointments().find((apt) => {
      const aptStart = new Date(apt.start)
      const aptEnd = new Date(apt.end)
      return slotTime >= aptStart && slotTime < aptEnd
    })
  }

  const getAppointmentTypeColor = (type) => {
    const colors = {
      'check-up': 'bg-blue-100 border-blue-500',
      cleaning: 'bg-green-100 border-green-500',
      filling: 'bg-yellow-100 border-yellow-500',
      'root-canal': 'bg-red-100 border-red-500',
      extraction: 'bg-purple-100 border-purple-500'
    }

    return colors[type] || 'bg-gray-100 border-gray-500'
  }

  return (
    <div class="bg-white shadow-md rounded p-6">
      <div class="flex justify-between items-center mb-4">
        <button onClick={goToPrevDay} class="p-2 border rounded hover:bg-gray-100">
          &lt; Previous
        </button>

        <h3 class="text-xl font-semibold">{formatDate(currentDate())}</h3>

        <button onClick={goToNextDay} class="p-2 border rounded hover:bg-gray-100">
          Next &gt;
        </button>
      </div>

      <div class="border rounded">
        <div class="grid grid-cols-5 bg-gray-100 p-2 font-semibold border-b">
          <div>Time</div>
          <div class="col-span-2">Patient</div>
          <div>Type</div>
          <div>Actions</div>
        </div>

        <For each={timeSlots}>
          {(timeSlot, index) => {
            const appointment = getAppointmentForTimeSlot(timeSlot)
            const isEven = index() % 2 === 0

            return (
              <div class={`grid grid-cols-5 ${isEven ? 'bg-white' : 'bg-gray-50'} border-b p-2`}>
                <div>{timeSlot}</div>

                {appointment ? (
                  <>
                    <div class="col-span-2">{appointment.patientName}</div>
                    <div>
                      <span
                        class={`px-2 py-1 rounded-full text-sm ${getAppointmentTypeColor(appointment.type)}`}
                      >
                        {appointment.type}
                      </span>
                    </div>
                    <div>
                      <button class="text-blue-600 hover:underline">Details</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div class="col-span-2">-</div>
                    <div>-</div>
                    <div>
                      <button class="text-green-600 hover:underline">Book</button>
                    </div>
                  </>
                )}
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}

export default Calendar
