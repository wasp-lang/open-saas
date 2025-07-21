import { useEffect, useState } from 'react';
import logo from '../../../client/static/logo.webp';
import nodeLogoDark from '../../../client/static/logos/nodejs-dark.png';
import nodeLogo from '../../../client/static/logos/nodejs-light.png';
import stripeLogoDark from '../../../client/static/logos/stripe-dark.png';
import stripeLogo from '../../../client/static/logos/stripe-light.png';
import tailwindLogoDark from '../../../client/static/logos/tailwind-dark.png';
import tailwindLogo from '../../../client/static/logos/tailwind-light.png';
import { cn } from '../../../lib/utils';
import AstroLogo from '../../logos/AstroLogo';
import OpenAILogo from '../../logos/OpenAILogo';
import PrismaLogo from '../../logos/PrismaLogo';
import ReactLogo from '../../logos/ReactLogo';
import ShadCNLogo from '../../logos/ShadCNLogo';

interface LogoConfig {
  id: string;
  component: React.ComponentType;
  circleIndex: number;
  position: number;
  size?: number;
}

const ImageLogo = ({
  src,
  alt,
  className,
  dark,
}: {
  src: string;
  alt: string;
  className?: string;
  dark?: boolean;
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-8 h-8', dark ? 'dark:block hidden' : 'dark:hidden', className)}
    />
  );
};

const logoConfigs: LogoConfig[] = [
  {
    id: 'wasp',
    component: () => <ImageLogo src={logo} alt='Wasp Logo' className='w-8 h-8 dark:block' dark={false} />,
    circleIndex: 1,
    position: 0,
  },
  { id: 'openai', component: OpenAILogo, circleIndex: 1, position: 120, size: 24 },
  { id: 'astro', component: AstroLogo, circleIndex: 1, position: 270, size: 24 },
  { id: 'prisma', component: PrismaLogo, circleIndex: 2, position: 90, size: 24 },
  { id: 'shadcn', component: ShadCNLogo, circleIndex: 2, position: 210, size: 24 },
  {
    id: 'tailwind',
    component: () => (
      <ImageLogo src={tailwindLogo} alt='Tailwind CSS Logo' className='w-8 h-8 dark:hidden' dark={false} />
    ),
    circleIndex: 2,
    position: 330,
  },
  {
    id: 'tailwind',
    component: () => <ImageLogo src={tailwindLogoDark} alt='Tailwind CSS Logo' dark={true} />,
    circleIndex: 2,
    position: 330,
  },
  {
    id: 'stripe',
    component: () => <ImageLogo src={stripeLogo} alt='Stripe Logo' dark={false} />,
    circleIndex: 3,
    position: 180,
  },
  {
    id: 'stripe',
    component: () => <ImageLogo src={stripeLogoDark} alt='Stripe Logo' dark={true} />,
    circleIndex: 3,
    position: 180,
  },
  { id: 'react', component: ReactLogo, circleIndex: 3, position: 300, size: 32 },
  {
    id: 'node',
    component: () => <ImageLogo src={nodeLogo} alt='Node.js Logo' dark={false} />,
    circleIndex: 3,
    position: 50,
  },
  {
    id: 'node',
    component: () => <ImageLogo src={nodeLogoDark} alt='Node.js Logo' dark={true} />,
    circleIndex: 3,
    position: 50,
  },
];

const circles = [
  { radius: 120, rotationSpeed: 0.5, circleRotationSpeed: 0.2 }, // Innermost circle
  { radius: 180, rotationSpeed: 0.3, circleRotationSpeed: 0.15 }, // Second circle
  { radius: 240, rotationSpeed: 0.2, circleRotationSpeed: 0.1 }, // Third circle
  { radius: 300, rotationSpeed: 0.1, circleRotationSpeed: 0.05 }, // Outermost circle
];

const gradients = [];

export default function Orbit() {
  const [rotation, setRotation] = useState(0);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setRotation((prev) => prev + 0.5);
    };

    const interval = setInterval(animate, 50); // 20 FPS
    return () => clearInterval(interval);
  }, []);

  // Calculate logo position on circle
  const getLogoPosition = (circleIndex: number, position: number, rotation: number) => {
    const circle = circles[circleIndex];
    const totalRotation = rotation * circle.rotationSpeed + position;
    const radians = (totalRotation * Math.PI) / 180;

    return {
      x: Math.cos(radians) * circle.radius,
      y: Math.sin(radians) * circle.radius,
    };
  };

  return (
    <div className='relative w-[500px] h-[500px] flex items-center justify-center'>
      <div className='absolute flex items-center gap-2 flex-col'>
        <p className='text-5xl font-bold text-gradient-primary'>100%</p>
        <p className='text-lg text-muted-foreground'>Open Source</p>
      </div>

      {circles.map((circle, circleIndex) => {
        const gradients = [
          `conic-gradient(from ${rotation * circle.circleRotationSpeed}deg, 
            hsl(var(--primary) / 0.15), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.15), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.05), 
            hsl(var(--primary) / 0.15)
          )`,
          `conic-gradient(from ${rotation * circle.circleRotationSpeed + 45}deg, 
            hsl(var(--primary) / 0.12), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.08), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.2), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.12)
          )`,
          `conic-gradient(from ${rotation * circle.circleRotationSpeed + 90}deg, 
            hsl(var(--primary) / 0.1), 
            hsl(var(--primary) / 0.18), 
            hsl(var(--primary) / 0.1), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.15), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.1)
          )`,
          `conic-gradient(from ${rotation * circle.circleRotationSpeed + 135}deg, 
            hsl(var(--primary) / 0.08), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.16), 
            hsl(var(--primary) / 0.06), 
            hsl(var(--primary) / 0), 
            hsl(var(--primary) / 0.12), 
            hsl(var(--primary) / 0.08)
          )`,
        ];

        return (
          <div
            key={circleIndex}
            className='absolute rounded-full'
            style={{
              width: circle.radius * 2,
              height: circle.radius * 2,
              background: gradients[circleIndex],
              mask: `radial-gradient(circle at center, transparent calc(${circle.radius}px - 2px), black calc(${circle.radius}px - 1px), black ${circle.radius}px, transparent calc(${circle.radius}px + 1px))`,
              WebkitMask: `radial-gradient(circle at center, transparent calc(${circle.radius}px - 2px), black calc(${circle.radius}px - 1px), black ${circle.radius}px, transparent calc(${circle.radius}px + 1px))`,
            }}
          />
        );
      })}

      {/* Logos positioned on circles */}
      {logoConfigs.map((logoConfig) => {
        const { x, y } = getLogoPosition(logoConfig.circleIndex, logoConfig.position, rotation);
        const LogoComponent = logoConfig.component;
        const logoSize = logoConfig.size || 32;

        return (
          <div
            key={logoConfig.id}
            className='absolute z-20'
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(${x}px - ${logoSize / 2}px), calc(${y}px - ${logoSize / 2}px))`,
              width: logoSize,
              height: logoSize,
            }}
          >
            <LogoComponent />
          </div>
        );
      })}
    </div>
  );
}
