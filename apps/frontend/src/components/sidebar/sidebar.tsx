import { createSignal, Show, For, type JSX } from "solid-js"
import { useLocation, Link } from "@tanstack/solid-router"

export interface SidebarProps {
  children: JSX.Element
}

export interface SidebarContextValue {
  isCollapsed: () => boolean
  setIsCollapsed: (value: boolean) => void
}

import { createContext, useContext } from "solid-js"

const SidebarContext = createContext<SidebarContextValue>()

export function Sidebar(props: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = createSignal(false)

  const value: SidebarContextValue = {
    isCollapsed,
    setIsCollapsed,
  }

  return (
    <SidebarContext.Provider value={value}>
      <aside
        class={`
          h-screen bg-[var(--color-bg-elevated)] border-r border-[var(--color-border-primary)]
          flex flex-col transition-all duration-300 ease-in-out relative
          ${isCollapsed() ? "w-16" : "w-64"}
        `}
      >
        {props.children}
      </aside>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar component")
  }
  return context
}

interface SidebarHeaderProps {
  logo?: JSX.Element
  title: string
  subtitle?: string
}

export function SidebarHeader(props: SidebarHeaderProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div class="p-4 border-b border-[var(--color-border-primary)] flex items-center gap-3">
      <div class="w-10 h-10 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center text-white flex-shrink-0">
        <Show when={props.logo} fallback={
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }>
          {props.logo}
        </Show>
      </div>
      <Show when={!isCollapsed()}>
        <div class="flex-1 overflow-hidden">
          <h1 class="text-base font-bold text-[var(--color-text-primary)] truncate">
            {props.title}
          </h1>
          <Show when={props.subtitle}>
            <p class="text-xs text-[var(--color-text-secondary)] truncate">
              {props.subtitle}
            </p>
          </Show>
        </div>
      </Show>
    </div>
  )
}

interface SidebarContentProps {
  children: JSX.Element
}

export function SidebarContent(props: SidebarContentProps) {
  return (
    <nav class="flex-1 overflow-y-auto py-4 sidebar-scrollbar">
      {props.children}
    </nav>
  )
}

interface SidebarSectionProps {
  title?: string
  children: JSX.Element
}

export function SidebarSection(props: SidebarSectionProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div class="mb-6">
      <Show when={props.title && !isCollapsed()}>
        <h2 class="px-4 mb-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
          {props.title}
        </h2>
      </Show>
      <div class="space-y-1">
        {props.children}
      </div>
    </div>
  )
}

export interface SidebarItemProps {
  href: string
  icon: JSX.Element
  label: string
  badge?: string | number
  hasSubmenu?: boolean
  onClick?: () => void
}

export function SidebarItem(props: SidebarItemProps) {
  const { isCollapsed } = useSidebar()
  const location = useLocation()
  
  const isActive = () => {
    const pathname = location().pathname
    return pathname === props.href || pathname.startsWith(props.href + '/')
  }

  return (
    <Link
      to={props.href}
      onClick={props.onClick}
      class={`
        flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all
        ${isActive() 
          ? "bg-[var(--color-brand-primary)] text-white" 
          : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
        }
        ${isCollapsed() ? "justify-center" : ""}
      `}
      title={isCollapsed() ? props.label : undefined}
    >
      <div class="w-5 h-5 flex-shrink-0">
        {props.icon}
      </div>
      <Show when={!isCollapsed()}>
        <span class="flex-1 font-medium text-sm truncate">
          {props.label}
        </span>
        <Show when={props.badge !== undefined}>
          <span class={`
            px-2 py-0.5 text-xs font-semibold rounded-full
            ${isActive() 
              ? "bg-white/20 text-white" 
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
            }
          `}>
            {props.badge}
          </span>
        </Show>
        <Show when={props.hasSubmenu}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </Show>
      </Show>
    </Link>
  )
}

interface SidebarFooterProps {
  children: JSX.Element
}

export function SidebarFooter(props: SidebarFooterProps) {
  return (
    <div class="border-t border-[var(--color-border-primary)] p-4">
      {props.children}
    </div>
  )
}

export function SidebarToggle() {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed())}
      class="absolute -right-3 top-20 z-10 w-6 h-6 bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-full flex items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-colors shadow-sm"
      title={isCollapsed() ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg 
        class={`w-3 h-3 text-[var(--color-text-secondary)] transition-transform ${isCollapsed() ? "rotate-180" : ""}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

interface SidebarUserProps {
  name: string
  email: string
  role?: string
  avatar?: string
  onLogout?: () => void
  menuItems?: Array<{
    label: string
    icon?: any
    onClick?: () => void
    href?: string
    isDanger?: boolean
  }>
}

export function SidebarUser(props: SidebarUserProps) {
  const { isCollapsed } = useSidebar()
  const [isMenuOpen, setIsMenuOpen] = createSignal(false)
  
  // Close menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-user-menu]')) {
      setIsMenuOpen(false)
    }
  }
  
  // Add/remove event listener
  const toggleMenu = () => {
    const newState = !isMenuOpen()
    setIsMenuOpen(newState)
    
    if (newState) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }

  return (
    <div class="relative" data-user-menu>
      <button
        onClick={toggleMenu}
        class={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors ${
          isCollapsed() ? "justify-center" : ""
        } ${isMenuOpen() ? "bg-[var(--color-bg-tertiary)]" : ""}`}
        title={isCollapsed() ? props.name : undefined}
      >
        <div class="w-10 h-10 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
          <Show when={props.avatar} fallback={
            <span class="text-sm uppercase">
              {props.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          }>
            <img src={props.avatar} alt={props.name} class="w-full h-full rounded-full object-cover" />
          </Show>
        </div>
        <Show when={!isCollapsed()}>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {props.name}
            </p>
            <p class="text-xs text-[var(--color-text-secondary)] truncate">
              {props.role || props.email}
            </p>
          </div>
          <svg 
            class={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${
              isMenuOpen() ? "rotate-180" : ""
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </Show>
      </button>

      {/* Dropdown Menu - Works for both collapsed and expanded states */}
      <Show when={isMenuOpen()}>
        <div 
          class={`absolute bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-lg shadow-xl overflow-hidden animate-slide-up ${
            isCollapsed() 
              ? "bottom-0 left-full ml-2 w-56" 
              : "bottom-full left-0 right-0 mb-2"
          }`}
        >
          {/* User info header when collapsed */}
          <Show when={isCollapsed()}>
            <div class="px-4 py-3 border-b border-[var(--color-border-primary)]">
              <p class="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {props.name}
              </p>
              <p class="text-xs text-[var(--color-text-secondary)] truncate">
                {props.role || props.email}
              </p>
            </div>
          </Show>
          
          <div class="py-2">
            <Show when={props.menuItems && props.menuItems.length > 0}>
              <For each={props.menuItems}>
                {(item: { label: string; icon?: any; onClick?: () => void; href?: string; isDanger?: boolean }) => (
                  <Show
                    when={item.href}
                    fallback={
                      <button
                        onClick={() => {
                          item.onClick?.()
                          setIsMenuOpen(false)
                          document.removeEventListener('click', handleClickOutside)
                        }}
                        class={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          item.isDanger
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                        }`}
                      >
                        <Show when={item.icon}>
                          <div class="w-5 h-5 flex-shrink-0">
                            {item.icon}
                          </div>
                        </Show>
                        <span>{item.label}</span>
                      </button>
                    }
                  >
                    <Link
                      to={item.href! as any}
                      onClick={() => {
                        setIsMenuOpen(false)
                        document.removeEventListener('click', handleClickOutside)
                      }}
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                      <Show when={item.icon}>
                        <div class="w-5 h-5 flex-shrink-0">
                          {item.icon}
                        </div>
                      </Show>
                      <span>{item.label}</span>
                    </Link>
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
