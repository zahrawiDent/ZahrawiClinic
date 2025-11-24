import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_authenticated/appointments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/appointments"!</div>
}
