import { SectionType } from '../../types'

export interface SectionPreset {
  type: SectionType
  name: string
  category: 'Navigation' | 'Hero & Intro' | 'Content & Media' | 'Conversion & Sales' | 'Application UI' | 'Support & Contact'
  description: string
  color: string
  iconName: string
  defaultNotes?: string
  defaultWireframeProps: {
    headline: string
    subtext: string
    buttonText?: string
    secondaryButtonText?: string
    badgeText?: string
    columns?: number
    placeholderItems?: Array<{ title: string; desc: string; meta?: string }>
  }
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    type: 'navbar',
    name: 'Navigation Bar (Header)',
    category: 'Navigation',
    description: 'Sticky or fixed site header with logo branding, navigation links, and primary CTA button',
    color: '#3b82f6',
    iconName: 'Navigation',
    defaultWireframeProps: {
      headline: 'CompanyLogo',
      subtext: 'Product • Features • Pricing • Docs',
      buttonText: 'Get Started',
    },
  },
  {
    type: 'hero',
    name: 'Hero Section',
    category: 'Hero & Intro',
    description: 'High-impact above-the-fold banner with primary value proposition and call to action',
    color: '#8b5cf6',
    iconName: 'Sparkles',
    defaultWireframeProps: {
      headline: 'Transform The Way You Build Software',
      subtext: 'Experience intuitive visual planning, automated architecture, and rapid prototyping.',
      buttonText: 'Start Free Trial',
      secondaryButtonText: 'Book a Demo',
      badgeText: '✨ Version 2.0 Live Now',
    },
  },
  {
    type: 'features',
    name: 'Features Grid',
    category: 'Content & Media',
    description: 'Showcase core capabilities, toolsets, and benefits in a clean multi-column card layout',
    color: '#10b981',
    iconName: 'LayoutGrid',
    defaultWireframeProps: {
      headline: 'Engineered for Scale & Reliability',
      subtext: 'Everything your team needs to plan, build, and deploy high-performing web platforms.',
      columns: 3,
      placeholderItems: [
        { title: 'Visual Hierarchy', desc: 'Drag-and-drop tree mapping with real-time connection lines.' },
        { title: 'Global Component Sync', desc: 'Centralized headers, footers, and sidebars across pages.' },
        { title: 'Low-Fi Wireframes', desc: 'One-click conversion from abstract sitemaps to tactile wireframes.' },
      ],
    },
  },
  {
    type: 'statistics',
    name: 'Statistics & Key Metrics',
    category: 'Conversion & Sales',
    description: 'Display quantifiable proof points, uptime stats, user counts, or performance figures',
    color: '#f59e0b',
    iconName: 'BarChart2',
    defaultWireframeProps: {
      headline: 'Proven Results at Every Metric',
      subtext: 'Trusted by enterprise organizations worldwide.',
      columns: 4,
      placeholderItems: [
        { title: '99.99%', desc: 'Guaranteed System Uptime' },
        { title: '10M+', desc: 'Active Monthly Requests' },
        { title: '4.9/5', desc: 'Customer Satisfaction Score' },
        { title: '120+', desc: 'Global Edge Locations' },
      ],
    },
  },
  {
    type: 'content',
    name: 'Content & Bento Box',
    category: 'Content & Media',
    description: 'Rich narrative content block, media showcase, or asymmetric bento-box feature highlight',
    color: '#06b6d4',
    iconName: 'FileText',
    defaultWireframeProps: {
      headline: 'Deep Dive into Our Core Engine',
      subtext: 'Detailed explanation of architectural advantages and developer experience.',
    },
  },
  {
    type: 'testimonials',
    name: 'Customer Testimonials',
    category: 'Conversion & Sales',
    description: 'Quotes, client reviews, ratings, and video testimonial placeholders for social proof',
    color: '#ec4899',
    iconName: 'MessageSquare',
    defaultWireframeProps: {
      headline: 'Loved by Product Teams Worldwide',
      subtext: 'Here is what designers, founders, and engineers say about our platform.',
      columns: 3,
      placeholderItems: [
        { title: 'Sarah Jenkins', desc: '"Cut our discovery and wireframing cycle down from 2 weeks to 2 hours."', meta: 'VP of Product @ TechCorp' },
        { title: 'Alex Rivera', desc: '"The offline generation and clean markdown exports make client briefs seamless."', meta: 'Founder @ StudioNorth' },
        { title: 'David Kim', desc: '"Cleanest sitemap tool on the market. The global section sync is a game changer."', meta: 'Lead Architect @ ScaleFast' },
      ],
    },
  },
  {
    type: 'pricing',
    name: 'Pricing Comparison',
    category: 'Conversion & Sales',
    description: 'Pricing tiers (Starter, Pro, Enterprise) with monthly/annual switch and feature checklist',
    color: '#10b981',
    iconName: 'Tag',
    defaultWireframeProps: {
      headline: 'Transparent, Fair Pricing',
      subtext: 'No hidden setup fees. Upgrade or cancel anytime.',
      columns: 3,
      placeholderItems: [
        { title: 'Starter Plan - $19/mo', desc: 'For solo creators and small exploratory projects.' },
        { title: 'Pro Plan - $49/mo', desc: 'For growing agencies and cross-functional product squads.' },
        { title: 'Enterprise - Custom', desc: 'Dedicated infrastructure, custom SLAs, and priority support.' },
      ],
      buttonText: 'Select Plan',
    },
  },
  {
    type: 'faq',
    name: 'FAQ Accordion',
    category: 'Support & Contact',
    description: 'Expandable question and answer accordion addressing buyer hesitations and support topics',
    color: '#6366f1',
    iconName: 'HelpCircle',
    defaultWireframeProps: {
      headline: 'Frequently Asked Questions',
      subtext: 'Find quick answers to common questions about accounts, billing, and export capabilities.',
      placeholderItems: [
        { title: 'Can I export to SVG and Markdown?', desc: 'Yes, full vector SVG and structured Markdown are supported natively.' },
        { title: 'Does this require an internet connection?', desc: 'No, all core sitemaps, offline rule-based generation, and IndexedDB work 100% offline.' },
        { title: 'How does global section sync work?', desc: 'Editing a global header or footer updates all connected instances across your sitemap in real time.' },
      ],
    },
  },
  {
    type: 'contact',
    name: 'Contact & Inquiry Form',
    category: 'Support & Contact',
    description: 'Lead capture form with name, email, project brief textarea, and company office locations',
    color: '#f97316',
    iconName: 'Mail',
    defaultWireframeProps: {
      headline: 'Get in Touch with Our Team',
      subtext: 'Have questions or ready to launch your next project? We are here to help.',
      buttonText: 'Submit Inquiry',
    },
  },
  {
    type: 'dashboard',
    name: 'Dashboard Cards',
    category: 'Application UI',
    description: 'Application metrics summary with status badges, quick shortcuts, and counter cards',
    color: '#3b82f6',
    iconName: 'Layout',
    defaultWireframeProps: {
      headline: 'Workspace Overview',
      subtext: 'Recent activity, deployment health, and quick actions.',
      columns: 4,
      placeholderItems: [
        { title: 'Active Projects', desc: '14 running', meta: '+2 this week' },
        { title: 'Total Wireframes', desc: '82 pages', meta: '98% synced' },
        { title: 'Team Members', desc: '6 collaborators', meta: '2 pending' },
        { title: 'Export Rate', desc: '48 files', meta: 'SVG / JSON' },
      ],
    },
  },
  {
    type: 'table',
    name: 'Data Table',
    category: 'Application UI',
    description: 'Structured records table with sorting, search filter, status badges, and action dropdowns',
    color: '#64748b',
    iconName: 'Table',
    defaultWireframeProps: {
      headline: 'Recent Transactions & Sitemaps',
      subtext: 'Filterable records list with sorting and row operations.',
    },
  },
  {
    type: 'form',
    name: 'Forms & Inputs',
    category: 'Application UI',
    description: 'Multi-field form layout for user inputs, settings configuration, or account management',
    color: '#8b5cf6',
    iconName: 'CheckSquare',
    defaultWireframeProps: {
      headline: 'Account Settings & Preferences',
      subtext: 'Configure notification preferences, security keys, and billing details.',
      buttonText: 'Save Changes',
    },
  },
  {
    type: 'chart',
    name: 'Charts & Analytics',
    category: 'Application UI',
    description: 'Data visualization widgets including area graphs, bar charts, and performance trends',
    color: '#06b6d4',
    iconName: 'PieChart',
    defaultWireframeProps: {
      headline: 'Traffic & Conversion Performance',
      subtext: 'Time-series growth trajectory and engagement volume over the last 30 days.',
    },
  },
  {
    type: 'team',
    name: 'Team & Leadership Grid',
    category: 'Content & Media',
    description: 'Member avatar, names, roles, social links, and brief biographical summaries',
    color: '#14b8a6',
    iconName: 'Users',
    defaultWireframeProps: {
      headline: 'Meet the Leadership Team',
      subtext: 'Passionate individuals committed to crafting exceptional digital products.',
      columns: 4,
      placeholderItems: [
        { title: 'Elena Rostova', desc: 'Co-Founder & CEO' },
        { title: 'Marcus Vance', desc: 'Head of Product Design' },
        { title: 'Aria Chen', desc: 'Chief Technology Officer' },
        { title: 'Liam O’Connor', desc: 'VP of Customer Experience' },
      ],
    },
  },
  {
    type: 'cta',
    name: 'Call to Action (CTA Banner)',
    category: 'Conversion & Sales',
    description: 'Full-width high contrast conversion card encouraging trial signups or sales conversations',
    color: '#f43f5e',
    iconName: 'Megaphone',
    defaultWireframeProps: {
      headline: 'Ready to Map Out Your Next Digital Product?',
      subtext: 'Join thousands of creators using OpenSitemap to plan clearer, better websites.',
      buttonText: 'Get Started for Free',
      secondaryButtonText: 'Contact Sales',
    },
  },
  {
    type: 'footer',
    name: 'Site Footer',
    category: 'Navigation',
    description: 'Multi-column footer layout with sitemap links, newsletter subscription, and legal copyright',
    color: '#475569',
    iconName: 'Columns',
    defaultWireframeProps: {
      headline: 'OpenSitemap Platform',
      subtext: 'Empowering product teams with visual architecture and tactile wireframing.',
      buttonText: 'Subscribe',
    },
  },
]
