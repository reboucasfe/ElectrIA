import React from 'react';
import { Zap, Lightbulb, BatteryCharging, Plug, CircuitBoard, Gauge } from 'lucide-react';

// Define a type for bubble configuration
interface BubbleConfig {
  icon: React.ElementType;
  size: number; // in px
  top: string; // percentage or px
  left: string; // percentage or px
  animationDelay: string; // e.g., '0s', '1s'
  animationDuration: string; // e.g., '5s', '7s'
  floatRange: number; // how much it floats up/down in px
}

const bubblesConfig: BubbleConfig[] = [
  { icon: Zap, size: 64, top: '20%', left: '15%', animationDelay: '0s', animationDuration: '6s', floatRange: 10 },
  { icon: Lightbulb, size: 80, top: '50%', left: '40%', animationDelay: '1s', animationDuration: '7s', floatRange: 15 },
  { icon: BatteryCharging, size: 48, top: '75%', left: '25%', animationDelay: '2s', animationDuration: '5s', floatRange: 8 },
  { icon: Plug, size: 56, top: '30%', left: '70%', animationDelay: '0.5s', animationDuration: '6.5s', floatRange: 12 },
  { icon: CircuitBoard, size: 72, top: '10%', left: '55%', animationDelay: '1.5s', animationDuration: '7.5s', floatRange: 18 },
  { icon: Gauge, size: 40, top: '60%', left: '85%', animationDelay: '2.5s', animationDuration: '5.5s', floatRange: 7 },
  { icon: Zap, size: 50, top: '85%', left: '60%', animationDelay: '3s', animationDuration: '6s', floatRange: 10 },
  { icon: Lightbulb, size: 60, top: '5%', left: '80%', animationDelay: '0.8s', animationDuration: '7s', floatRange: 13 },
];

const FloatingBubbles = () => {
  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {bubblesConfig.map((bubble, index) => {
        const IconComponent = bubble.icon;
        const iconSize = bubble.size * 0.6; // Icon size relative to bubble size

        return (
          <div
            key={index}
            className="absolute rounded-full bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg pointer-events-auto"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              top: bubble.top,
              left: bubble.left,
              animation: `float-animation ${bubble.animationDuration} ease-in-out ${bubble.animationDelay} infinite alternate`,
              '--float-range': `${bubble.floatRange}px`, // Custom property for float range
            } as React.CSSProperties} // Type assertion for custom CSS properties
          >
            <IconComponent className="text-blue-600" size={iconSize} />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingBubbles;