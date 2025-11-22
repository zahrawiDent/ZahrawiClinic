import type { JSX } from "solid-js"

interface FeatureGridProps {
  children: JSX.Element
  class?: string
}

/**
 * Feature Grid Component
 * 
 * A responsive grid container for feature cards
 * Automatically handles responsive column layouts
 * 
 * @example
 * <FeatureGrid>
 *   <FeatureCard ... />
 *   <FeatureCard ... />
 * </FeatureGrid>
 */
export function FeatureGrid(props: FeatureGridProps) {
  return (
    <div class={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${props.class || ""}`}>
      {props.children}
    </div>
  )
}
