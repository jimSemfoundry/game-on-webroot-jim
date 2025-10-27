import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/sports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sports/"!</div>
}
