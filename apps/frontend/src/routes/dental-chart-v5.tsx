import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/dental-chart-v5')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dental-chart-v5"!</div>
}
