import { createRootRouteWithContext, Outlet } from "@tanstack/solid-router"
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools"
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import type { RouterContext } from "@/index"
import { ToastContainer } from "@/components/toast"

const RootLayout = () => {


  return (
    <>
      <ToastContainer />

      <Outlet />
      <TanStackRouterDevtools />
      <SolidQueryDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout
})
