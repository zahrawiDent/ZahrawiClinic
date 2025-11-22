import type { JSX } from "solid-js"

interface FeatureIconProps {
  icon: JSX.Element
  gradient: "green" | "blue" | "purple" | "orange" | "pink" | "teal" | "red" | "indigo"
}

/**
 * Feature Icon Component
 * 
 * A colored icon container with gradient background for feature cards
 * 
 * @example
 * <FeatureIcon gradient="green" icon={<svg>...</svg>} />
 */
export function FeatureIcon(props: FeatureIconProps) {
  const gradientClasses = () => {
    switch (props.gradient) {
      case "green":
        return "from-green-500 to-green-600"
      case "blue":
        return "from-blue-500 to-blue-600"
      case "purple":
        return "from-purple-500 to-purple-600"
      case "orange":
        return "from-orange-500 to-orange-600"
      case "pink":
        return "from-pink-500 to-pink-600"
      case "teal":
        return "from-teal-500 to-teal-600"
      case "red":
        return "from-red-500 to-red-600"
      case "indigo":
        return "from-indigo-500 to-indigo-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div class={`w-14 h-14 bg-gradient-to-br ${gradientClasses()} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
      {props.icon}
    </div>
  )
}
