# Animated Pages Guide

Your project now has smooth page animations and component animations. Here's how to use them:

## 1. **Page Transitions** (Already Applied)
All pages automatically have fade-in/scale animations when navigating between routes. This is handled by the `AnimatedPage` wrapper in `App.tsx`.

## 2. **Animation Components**

### **AnimatedContainer** - Scroll-triggered animations
Use this to animate elements as they come into view:

```tsx
import { AnimatedContainer } from '@/components/motion';

export default function MyComponent() {
  return (
    <AnimatedContainer variant="fade" delay={0.2}>
      <div>Content animates in when scrolled into view</div>
    </AnimatedContainer>
  );
}
```

**Variants:**
- `fade` - Simple opacity fade
- `slide` - Slide in from the right
- `scale` - Scale up from smaller size
- `page` - Default page animation (fade + slide up)

### **StaggerContainer & StaggerItem** - Staggered list animations
Perfect for product grids, lists, etc:

```tsx
import { StaggerContainer, StaggerItem } from '@/components/motion';

export default function ProductList() {
  return (
    <StaggerContainer className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### **FloatAnim** - Floating animation
Smooth up-down floating effect:

```tsx
import { FloatAnim } from '@/components/motion';

<FloatAnim distance={15} className="w-32">
  <img src="hero-image.png" alt="Hero" />
</FloatAnim>
```

### **PulseAnim** - Pulsing animation
Smooth scale pulse effect:

```tsx
import { PulseAnim } from '@/components/motion';

<PulseAnim scale={[1, 1.15]} className="flex items-center justify-center">
  <div className="bg-primary rounded-full w-12 h-12" />
</PulseAnim>
```

## 3. **Using Animation Variants Directly**
For advanced use cases, import animation variants:

```tsx
import { motion } from 'framer-motion';
import { pageVariants, slideVariants, fadeVariants } from '@/lib/animations';

<motion.div
  variants={slideVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Custom animated content
</motion.div>
```

## 4. **Examples**

### Hero Section with Float Animation
```tsx
import { AnimatedPage, FloatAnim } from '@/components/motion';

export default function Home() {
  return (
    <AnimatedPage>
      <div className="flex items-center justify-center h-screen">
        <FloatAnim distance={20}>
          <h1 className="text-5xl font-bold">Welcome to Surema</h1>
        </FloatAnim>
      </div>
    </AnimatedPage>
  );
}
```

### Product Grid with Stagger
```tsx
import { StaggerContainer, StaggerItem } from '@/components/motion';

export default function Shop() {
  return (
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### Feature Section
```tsx
import { AnimatedContainer } from '@/components/motion';

export default function Features() {
  return (
    <div className="space-y-4">
      <AnimatedContainer variant="slide">
        <Feature icon="check" text="Fast shipping" />
      </AnimatedContainer>
      <AnimatedContainer variant="slide" delay={0.1}>
        <Feature icon="shield" text="Secure payment" />
      </AnimatedContainer>
      <AnimatedContainer variant="slide" delay={0.2}>
        <Feature icon="heart" text="Quality products" />
      </AnimatedContainer>
    </div>
  );
}
```

## 5. **Customization**

All animation timings and effects can be customized by editing `/src/lib/animations.ts` or passing props to components.

### Adjust page transition speed:
Edit the `transition.duration` in `animations.ts`:
```ts
visible: {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.3, // Change this value (lower = faster)
    ease: 'easeOut',
  },
}
```

### Disable animations for specific pages:
Wrap with `<motion.div>` directly without `AnimatedPage`:
```tsx
<motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
  No animation content
</motion.div>
```

## 6. **Performance Tips**
- Use `whileInView` (in `AnimatedContainer`) for animations that trigger on scroll
- Avoid animating too many elements simultaneously to prevent jank
- Use `will-change: transform` in Tailwind for animated elements
- Set `viewport={{ once: true }}` to animate only once per scroll
