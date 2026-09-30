import { modulesByCategory } from '../data/platformModules';

export interface NavItem {
  label: string;
  path?: string;
  icon?: string;
  id?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: 'Home', path: '/', icon: '🏠' },
  {
    label: 'Business Applications',
    children: modulesByCategory('business').map((m) => ({
      id: m.id,
      label: m.name,
      path: m.path,
      icon: m.icon,
    })),
  },
  {
    label: 'AI Platform Services',
    children: modulesByCategory('platform').map((m) => ({
      id: m.id,
      label: m.name,
      path: m.path,
      icon: m.icon,
    })),
  },
  {
    label: 'Enterprise Administration',
    children: modulesByCategory('administration').map((m) => ({
      id: m.id,
      label: m.name,
      path: m.path,
      icon: m.icon,
    })),
  },
];

export const specialRoutes: { label: string; path: string }[] = [];
