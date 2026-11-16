import {
  Apple,
  BarChart3,
  Beef,
  BicepsFlexed,
  Bot,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  Gem,
  Link2,
  Medal,
  Monitor,
  Moon,
  NotebookPen,
  PartyPopper,
  Ruler,
  Scale,
  Star,
  Sun,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
  Sprout,
  Heart,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/**
 * Icons referenced by name from data (achievement/goal definitions, settings options).
 * Keeping names as strings lets those definitions stay serialisable.
 */
const ICONS: Record<string, LucideIcon> = {
  Apple,
  BarChart3,
  Beef,
  BicepsFlexed,
  Bot,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  Gem,
  Link2,
  Medal,
  Monitor,
  Moon,
  NotebookPen,
  PartyPopper,
  Ruler,
  Scale,
  Star,
  Sun,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
  Sprout,
  Heart,
};

export type AppIconName = keyof typeof ICONS;

interface AppIconProps extends LucideProps {
  name: string;
}

export function AppIcon({ name, size = '1em', ...rest }: AppIconProps) {
  const Icon = ICONS[name] ?? Target;
  return <Icon size={size} aria-hidden="true" {...rest} />;
}
