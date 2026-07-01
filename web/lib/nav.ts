import {
  BarChart3,
  FileText,
  Layers,
  Megaphone,
  PenLine,
  ScrollText,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type Role = 'owner' | 'member';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[]; // peran yang boleh melihat (IA §7 Permission Matrix)
}

export interface NavGroup {
  section: string;
  items: NavItem[];
}

// Struktur menu — IA §1 Sitemap, §3 Menu Structure, §9.3 ikon DS
export const NAV: NavGroup[] = [
  {
    section: 'CREATIVE',
    items: [
      { label: 'Content Brief', href: '/creative/brief', icon: FileText, roles: ['owner', 'member'] },
      { label: 'Copywriting', href: '/creative/copy', icon: PenLine, roles: ['owner', 'member'] },
      { label: 'Humanize', href: '/creative/humanize', icon: Sparkles, roles: ['owner', 'member'] },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      { label: 'Social Performance', href: '/insights/social', icon: BarChart3, roles: ['owner', 'member'] },
      { label: 'Revenue', href: '/insights/revenue', icon: TrendingUp, roles: ['owner', 'member'] },
    ],
  },
  {
    section: 'OPS',
    items: [{ label: 'Ads Engine', href: '/ads', icon: Megaphone, roles: ['owner', 'member'] }],
  },
  {
    section: 'SETTINGS',
    items: [
      { label: 'Brand Profiles', href: '/settings/brand-profiles', icon: Layers, roles: ['owner', 'member'] },
      { label: 'Social Accounts', href: '/settings/social-accounts', icon: Share2, roles: ['owner'] },
      { label: 'Users', href: '/settings/users', icon: Users, roles: ['owner'] },
      { label: 'Audit Log', href: '/settings/audit-log', icon: ScrollText, roles: ['owner'] },
    ],
  },
];

// Brand switcher hanya muncul di CREATIVE & Social (IA §2.3)
export const BRAND_SWITCHER_ROUTES = ['/creative', '/insights/social'];
