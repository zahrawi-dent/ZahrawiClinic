import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/(app)/about')({
  component: About,
})

function About() {
  return <div class="p-2">Hello from About!</div>
}
