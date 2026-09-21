import React, { useState } from 'react';
import {
  Type,
  AlignLeft,
  MousePointerClick,
  Image as ImageIcon,
  Minus,
  MoveVertical,
  LayoutGrid,
  Columns as ColumnsIcon,
  Megaphone,
  ShoppingBag,
  Tag,
  Star,
  DollarSign,
  Send,
  Share2,
  Code,
  Square,
  Circle,
  Bookmark,
  Layers,
  Sparkles,
  Plus,
} from 'lucide-react';
import { ComponentType, CategoryType, LibraryItem, ComponentStyles, ComponentProps } from '../../types/builder';

interface ComponentSidebarProps {
  onAddComponent: (type: ComponentType, defaultProps?: ComponentProps, defaultStyles?: ComponentStyles) => void;
  reusableBlocks?: Array<{ name: string; components: any[] }>;
  onAddReusableBlock?: (block: any) => void;
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  // BASIC
  {
    type: 'heading',
    label: 'Heading',
    category: 'BASIC',
    iconName: 'Type',
    defaultProps: { content: 'Main Email Heading' },
    defaultStyles: { fontSize: '24px', fontWeight: '700', color: '#111827', paddingTop: '12px', paddingBottom: '12px' },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'BASIC',
    iconName: 'AlignLeft',
    defaultProps: { content: 'Write your email body text here. Keep it engaging and easy to read.' },
    defaultStyles: { fontSize: '15px', color: '#374151', lineHeight: '1.6', paddingTop: '8px', paddingBottom: '8px' },
  },
  {
    type: 'button',
    label: 'Button',
    category: 'BASIC',
    iconName: 'MousePointerClick',
    defaultProps: { content: 'Call To Action →', url: 'https://example.com', openInNewWindow: true },
    defaultStyles: { backgroundColor: '#2563EB', color: '#FFFFFF', borderRadius: '8px', fontSize: '15px', paddingTop: '12px', paddingBottom: '12px', textAlign: 'center' },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'BASIC',
    iconName: 'ImageIcon',
    defaultProps: { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60', alt: 'Sample Image', source: 'url' },
    defaultStyles: { textAlign: 'center', paddingTop: '12px', paddingBottom: '12px', borderRadius: '8px' },
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'BASIC',
    iconName: 'Minus',
    defaultProps: {},
    defaultStyles: { borderColor: '#E2E8F0', borderWidth: '1px', borderStyle: 'solid', marginTop: '16px', marginBottom: '16px' },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'BASIC',
    iconName: 'MoveVertical',
    defaultProps: {},
    defaultStyles: { height: '24px' },
  },

  // LAYOUT
  {
    type: 'container',
    label: 'Container',
    category: 'LAYOUT',
    iconName: 'LayoutGrid',
    defaultProps: {},
    defaultStyles: { backgroundColor: '#FFFFFF', paddingTop: '16px', paddingRight: '16px', paddingBottom: '16px', paddingLeft: '16px' },
  },
  {
    type: 'box',
    label: 'Box',
    category: 'LAYOUT',
    iconName: 'Square',
    defaultProps: {},
    defaultStyles: { backgroundColor: '#F8FAFC', borderRadius: '12px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#E2E8F0', paddingTop: '16px', paddingRight: '16px', paddingBottom: '16px', paddingLeft: '16px' },
  },
  {
    type: 'columns',
    label: '2 Columns',
    category: 'LAYOUT',
    iconName: 'ColumnsIcon',
    defaultProps: { columnsCount: 2 },
    defaultStyles: { paddingTop: '8px', paddingBottom: '8px' },
  },
  {
    type: 'columns',
    label: '3 Columns',
    category: 'LAYOUT',
    iconName: 'ColumnsIcon',
    defaultProps: { columnsCount: 3 },
    defaultStyles: { paddingTop: '8px', paddingBottom: '8px' },
  },

  // MARKETING
  {
    type: 'announcement_bar',
    label: 'Announcement Bar',
    category: 'MARKETING',
    iconName: 'Megaphone',
    defaultProps: { content: '⚡ Limited Time Offer: Save 20% on all plans this week!' },
    defaultStyles: { backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', textAlign: 'center', paddingTop: '10px', paddingBottom: '10px' },
  },
  {
    type: 'product_card',
    label: 'Product Card',
    category: 'MARKETING',
    iconName: 'ShoppingBag',
    defaultProps: { productName: 'Premium Headphones', productDesc: 'High fidelity wireless noise cancelling headphones.', price: '$199.99', originalPrice: '$249.99', content: 'Shop Now →', src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
    defaultStyles: { backgroundColor: '#FFFFFF', borderRadius: '12px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#E2E8F0', paddingTop: '16px', paddingRight: '16px', paddingBottom: '16px', paddingLeft: '16px' },
  },

  // SOCIAL
  {
    type: 'social_icons',
    label: 'Social Icons',
    category: 'SOCIAL',
    iconName: 'Share2',
    defaultProps: {
      socialLinks: [
        { platform: 'Twitter', url: 'https://twitter.com' },
        { platform: 'Facebook', url: 'https://facebook.com' },
        { platform: 'Instagram', url: 'https://instagram.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
      ],
    },
    defaultStyles: { textAlign: 'center', paddingTop: '16px', paddingBottom: '16px' },
  },

  // SPECIAL
  {
    type: 'custom_html',
    label: 'Custom HTML',
    category: 'SPECIAL',
    iconName: 'Code',
    defaultProps: { htmlRaw: '<div style="padding:10px;background:#f1f5f9;text-align:center;">Custom HTML snippet</div>' },
    defaultStyles: { paddingTop: '8px', paddingBottom: '8px' },
  },
  {
    type: 'footer',
    label: 'Footer & Unsubscribe',
    category: 'SPECIAL',
    iconName: 'Layers',
    defaultProps: {},
    defaultStyles: { paddingTop: '24px', paddingBottom: '24px' },
  },
];

const renderIcon = (name: string) => {
  switch (name) {
    case 'Type': return <Type className="w-4 h-4" />;
    case 'AlignLeft': return <AlignLeft className="w-4 h-4" />;
    case 'MousePointerClick': return <MousePointerClick className="w-4 h-4" />;
    case 'ImageIcon': return <ImageIcon className="w-4 h-4" />;
    case 'Minus': return <Minus className="w-4 h-4" />;
    case 'MoveVertical': return <MoveVertical className="w-4 h-4" />;
    case 'LayoutGrid': return <LayoutGrid className="w-4 h-4" />;
    case 'ColumnsIcon': return <ColumnsIcon className="w-4 h-4" />;
    case 'Megaphone': return <Megaphone className="w-4 h-4" />;
    case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
    case 'Share2': return <Share2 className="w-4 h-4" />;
    case 'Code': return <Code className="w-4 h-4" />;
    case 'Layers': return <Layers className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

export const ComponentSidebar: React.FC<ComponentSidebarProps> = ({
  onAddComponent,
  reusableBlocks = [],
  onAddReusableBlock,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'MY_BLOCKS'>('BASIC');

  const categories: Array<{ id: CategoryType | 'MY_BLOCKS'; label: string }> = [
    { id: 'BASIC', label: 'Basic' },
    { id: 'LAYOUT', label: 'Layout' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'SOCIAL', label: 'Social' },
    { id: 'SPECIAL', label: 'Special' },
    { id: 'MY_BLOCKS', label: 'Saved Blocks' },
  ];

  const filteredItems = LIBRARY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <aside className="w-64 bg-white border-r border-sky-200/80 flex flex-col h-full shrink-0 select-none overflow-hidden shadow-sm">
      <div className="p-4 border-b border-sky-100 bg-sky-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Component Library</span>
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Click or drag elements to canvas</p>
      </div>

      {/* Category Pills */}
      <div className="p-3 border-b border-sky-100 bg-white flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Components List */}
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {activeCategory === 'MY_BLOCKS' ? (
          reusableBlocks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-sky-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No saved blocks yet.</p>
              <p className="text-[10px] text-slate-400">Save custom sections in canvas to reuse here.</p>
            </div>
          ) : (
            reusableBlocks.map((b, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAddReusableBlock && onAddReusableBlock(b)}
                className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100 border border-sky-200 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                  <span>{b.name}</span>
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </button>
            ))
          )
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.type);
                e.dataTransfer.setData('application/json', JSON.stringify(item));
              }}
              onClick={() => onAddComponent(item.type, item.defaultProps, item.defaultStyles)}
              className="p-3 rounded-xl bg-white hover:bg-sky-50/80 border border-sky-200/80 hover:border-blue-400 shadow-xs cursor-grab active:cursor-grabbing transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {renderIcon(item.iconName)}
                </div>
                <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-sky-400 group-hover:text-blue-600">+ Add</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
