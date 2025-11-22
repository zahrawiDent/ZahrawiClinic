import type { JSX } from "solid-js"

interface FeatureCardProps {
  icon: JSX.Element
  title: string
  description: string
  class?: string
}

/**
 * Feature Card Component
 * 
 * A card component for displaying features with an icon, title, and description
 * Includes hover effects and responsive styling
 * 
 * @example
 * <FeatureCard
 *   icon={<FeatureIcon gradient="green" icon={<svg>...</svg>} />}
 *   title="Feature Title"
 *   description="Feature description text"
 * />
 */
export function FeatureCard(props: FeatureCardProps) {
  return (
    <div class={`bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 ${props.class || ""}`}>
      {props.icon}
      <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">
        {props.title}
      </h3>
      <p class="text-[var(--color-text-secondary)] leading-relaxed">
        {props.description}
      </p>
    </div>
  )
}
