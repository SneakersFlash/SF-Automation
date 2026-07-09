import {
  BarChart3,
  CircleDot,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  Images,
  Layers,
  LayoutGrid,
  Mail,
  Megaphone,
  MessageSquare,
  PenLine,
  ScrollText,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
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
    // Tiap tipe konten = menu sendiri; halaman builder terkunci ke tipe itu.
    section: 'CONTENT',
    items: [
      { label: 'Carousel', href: '/content/carousel', icon: Images, roles: ['owner', 'member'] },
      { label: 'Single Image', href: '/content/image', icon: ImageIcon, roles: ['owner', 'member'] },
      { label: 'Video Core', href: '/content/video_core', icon: Video, roles: ['owner', 'member'] },
      { label: 'Ads', href: '/content/ads', icon: Target, roles: ['owner', 'member'] },
      { label: '9-Feeds', href: '/content/feeds9', icon: LayoutGrid, roles: ['owner', 'member'] },
      { label: 'Story', href: '/content/story', icon: CircleDot, roles: ['owner', 'member'] },
      { label: 'Short Video', href: '/content/short_video', icon: Clapperboard, roles: ['owner', 'member'] },
      { label: 'Thread', href: '/content/thread', icon: MessageSquare, roles: ['owner', 'member'] },
      { label: 'Email', href: '/content/email', icon: Mail, roles: ['owner', 'member'] },
      { label: 'Blog', href: '/content/blog', icon: FileText, roles: ['owner', 'member'] },
    ],
  },
  {
    section: 'CREATIVE',
    items: [
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
export const BRAND_SWITCHER_ROUTES = ['/content', '/creative', '/insights/social'];
