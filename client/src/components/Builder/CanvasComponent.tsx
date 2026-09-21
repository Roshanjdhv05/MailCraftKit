import React, { useState } from 'react';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Bookmark,
  ImageIcon,
  Plus,
  Type,
  Layout,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Sparkles,
} from 'lucide-react';
import { EmailComponent, ComponentStyles, ComponentType, ThemeConfig } from '../../types/builder';
import { DEFAULT_THEME } from '../../lib/emailRenderer';

interface CanvasComponentProps {
  component: EmailComponent;
  isSelected: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onUpdateComponent: (id: string, updatedProps: any, updatedStyles: any) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
  onSaveReusableBlock?: (comp: EmailComponent) => void;
  onOpenImageModal?: (comp: EmailComponent) => void;
  onAddNestedComponent?: (parentId: string, childType: ComponentType, columnIndex?: number) => void;
  theme?: ThemeConfig;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  component,
  isSelected,
  selectedId,
  onSelect,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onSaveReusableBlock,
  onOpenImageModal,
  onAddNestedComponent,
  theme,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const activeTheme = theme || DEFAULT_THEME;

  const { id, type, props, styles } = component;

  // Dynamic Theme Color Resolvers (fall back to activeTheme when default/unmodified)
  const getHeadingColor = () => {
    if (styles.color && styles.color !== '#111827' && styles.color !== '#0f172a' && styles.color !== '#000000') {
      return styles.color;
    }
    return activeTheme.heading;
  };

  const getTextColor = () => {
    if (styles.color && styles.color !== '#374151' && styles.color !== '#64748b' && styles.color !== '#334155' && styles.color !== '#111827') {
      return styles.color;
    }
    return activeTheme.text;
  };

  const getButtonBg = () => {
    if (styles.backgroundColor && styles.backgroundColor !== '#2563EB' && styles.backgroundColor !== '#0f172a') {
      return styles.backgroundColor;
    }
    return activeTheme.button;
  };

  const getButtonTextColor = () => {
    if (styles.color && styles.color !== '#FFFFFF' && styles.color !== '#ffffff') {
      return styles.color;
    }
    return activeTheme.buttonText;
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('github')) return <Github className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const renderContent = () => {
    switch (type) {
      case 'heading':
        return (
          <h1
            contentEditable={isEditingInline}
            suppressContentEditableWarning
            onBlur={(e) => {
              setIsEditingInline(false);
              onUpdateComponent(id, { content: e.currentTarget.textContent || '' }, {});
            }}
            onClick={() => setIsEditingInline(true)}
            style={{
              margin: 0,
              fontSize: styles.fontSize || '24px',
              fontWeight: styles.fontWeight || '700',
              textAlign: styles.textAlign || 'left',
              color: getHeadingColor(),
              fontFamily: styles.fontFamily || 'inherit',
            }}
          >
            {props.content || 'Heading'}
          </h1>
        );

      case 'paragraph':
      case 'text':
        return (
          <p
            contentEditable={isEditingInline}
            suppressContentEditableWarning
            onBlur={(e) => {
              setIsEditingInline(false);
              onUpdateComponent(id, { content: e.currentTarget.textContent || '' }, {});
            }}
            onClick={() => setIsEditingInline(true)}
            style={{
              margin: 0,
              fontSize: styles.fontSize || '16px',
              lineHeight: styles.lineHeight || '1.6',
              textAlign: styles.textAlign || 'left',
              color: getTextColor(),
              fontFamily: styles.fontFamily || 'inherit',
            }}
          >
            {props.content || 'Enter text...'}
          </p>
        );

      case 'button':
        return (
          <div style={{ textAlign: styles.textAlign || 'center' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: getButtonBg(),
                color: getButtonTextColor(),
                padding: '12px 28px',
                borderRadius: styles.borderRadius || '8px',
                fontWeight: 700,
                fontSize: styles.fontSize || '15px',
              }}
            >
              {props.content || 'Button'}
            </span>
          </div>
        );

      case 'image':
        return (
          <div style={{ textAlign: styles.textAlign || 'center' }} className="relative group/img">
            {props.src ? (
              <img
                src={props.src}
                alt={props.alt || 'Image'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'inline-block',
                  borderRadius: styles.borderRadius || '0px',
                }}
              />
            ) : (
              <div
                onClick={() => onOpenImageModal && onOpenImageModal(component)}
                className="w-full h-40 bg-sky-50 border-2 border-dashed border-sky-300 rounded-xl flex items-center justify-center text-blue-600 cursor-pointer hover:bg-sky-100/50 transition-all"
              >
                <div className="text-center space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-semibold">Click to Upload / Set Image</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <hr
            style={{
              border: 0,
              borderTop: `${styles.borderWidth || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#E2E8F0'}`,
              margin: '8px 0',
            }}
          />
        );

      case 'spacer':
        return <div style={{ height: styles.height || '24px', backgroundColor: '#F8FAFC' }} className="border border-dashed border-sky-200/50" />;

      case 'box':
      case 'container': {
        const boxChildren = component.children?.[0] || [];
        return (
          <div
            style={{
              backgroundColor: styles.backgroundColor || activeTheme.contentBackground,
              padding: styles.paddingTop || '16px',
              borderRadius: styles.borderRadius || '12px',
              borderColor: styles.borderColor || activeTheme.border,
            }}
            className="border border-sky-200 space-y-3 relative group/box min-h-[100px]"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-600 pb-1 border-b border-sky-100 opacity-0 group-hover/box:opacity-100 transition-opacity">
              <span>Box Container</span>
              {onAddNestedComponent && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent(id, 'heading', 0);
                    }}
                    className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                  >
                    + Heading
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent(id, 'paragraph', 0);
                    }}
                    className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                  >
                    + Text
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent(id, 'image', 0);
                    }}
                    className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                  >
                    + Image
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent(id, 'button', 0);
                    }}
                    className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                  >
                    + Button
                  </button>
                </div>
              )}
            </div>

            {boxChildren.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-sky-200 rounded-xl bg-white/60 space-y-2">
                <p className="text-xs text-slate-500 font-medium">Box is empty</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent?.(id, 'heading', 0);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold shadow-xs"
                  >
                    + Add Heading
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNestedComponent?.(id, 'paragraph', 0);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 text-blue-900 text-[11px] font-semibold border border-sky-200"
                  >
                    + Add Text
                  </button>
                </div>
              </div>
            ) : (
              boxChildren.map((child) => (
                <CanvasComponent
                  key={child.id}
                  component={child}
                  isSelected={selectedId === child.id}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onUpdateComponent={onUpdateComponent}
                  onDeleteComponent={onDeleteComponent}
                  onDuplicateComponent={onDuplicateComponent}
                  onMoveComponent={onMoveComponent}
                  onSaveReusableBlock={onSaveReusableBlock}
                  onOpenImageModal={onOpenImageModal}
                  onAddNestedComponent={onAddNestedComponent}
                  theme={activeTheme}
                />
              ))
            )}
          </div>
        );
      }

      case 'columns': {
        const colGroups = component.children || [[], []];
        const isAnimated = props.animateTicker;

        if (isAnimated) {
          const slides = colGroups[0] || [];
          const displaySlides = slides;

          return (
            <div className="space-y-3 p-4 bg-sky-50/40 border border-sky-200/80 rounded-2xl relative">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-blue-600 bg-sky-100/70 px-3 py-1.5 rounded-lg w-full border border-sky-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>Auto-Scroll Ticker ({slides.length} Cards — Single Row)</span>
                </div>
                <span className="text-[9px] text-slate-500 font-normal">Hover to pause</span>
              </div>

              <div className="ticker-wrapper overflow-hidden w-full relative rounded-2xl border border-sky-100 bg-slate-50/50 p-3">
                <div
                  className="animate-ticker-rtl flex flex-nowrap items-stretch gap-5"
                  style={{ '--ticker-speed': props.animationSpeed || '25s', width: 'max-content' } as React.CSSProperties}
                >
                  {displaySlides.map((child, idx) => {
                    const isSelectedCard = selectedId === child.id;
                    const slideItems = child.children?.[0] || [];
                    const imgComp = slideItems.find((c) => c.type === 'image');
                    const headingComp = slideItems.find((c) => c.type === 'heading');
                    const textComp = slideItems.find((c) => c.type === 'paragraph' || c.type === 'text');
                    const btnComp = slideItems.find((c) => c.type === 'button');

                    const imgSrc = imgComp?.props.src || child.props.src || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80';
                    const titleText = headingComp?.props.content || child.props.content || 'Card Title';
                    const descText = textComp?.props.content || child.props.productDesc || 'Use this text to describe products, share details on availability and style.';
                    const btnText = btnComp?.props.content || 'LEARN MORE';

                    return (
                      <div
                        key={`${child.id}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(child.id);
                        }}
                        style={{ backgroundColor: child.styles?.backgroundColor || activeTheme.contentBackground || '#ffffff' }}
                        className={`w-72 shrink-0 rounded-2xl p-4 shadow-sm border transition-all duration-200 flex flex-col justify-between space-y-3 relative group/slide ${
                          isSelectedCard ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {/* 1. Large Image */}
                        <div className="relative overflow-hidden rounded-xl bg-slate-100 group/img w-full h-48">
                          <img
                            src={imgSrc}
                            alt={titleText}
                            className="w-full h-48 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenImageModal && onOpenImageModal(imgComp || child);
                            }}
                            className="absolute inset-0 bg-slate-900/40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl"
                          >
                            <ImageIcon className="w-4 h-4" /> Change Image
                          </button>
                        </div>

                        {/* 2. Title & Description */}
                        <div className="space-y-1.5 flex-1">
                          <h3
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newText = e.currentTarget.textContent || '';
                              if (headingComp) onUpdateComponent(headingComp.id, { content: newText }, {});
                              else onUpdateComponent(child.id, { content: newText }, {});
                            }}
                            style={{ color: activeTheme.heading }}
                            className="font-bold text-base text-slate-900 leading-snug outline-none focus:bg-sky-50 px-1 rounded"
                          >
                            {titleText}
                          </h3>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newText = e.currentTarget.textContent || '';
                              if (textComp) onUpdateComponent(textComp.id, { content: newText }, {});
                            }}
                            style={{ color: activeTheme.text }}
                            className="text-xs text-slate-600 leading-relaxed outline-none focus:bg-sky-50 px-1 rounded"
                          >
                            {descText}
                          </p>
                        </div>

                        {/* 3. Action Link Button */}
                        <div className="pt-2 border-t border-slate-100">
                          <a
                            href={btnComp?.props.url || '#'}
                            onClick={(e) => e.preventDefault()}
                            style={{ color: activeTheme.primary }}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:opacity-80 transition-opacity"
                          >
                            <span>{btnText}</span>
                            <span>&rarr;</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 rounded-xl">
              {colGroups.map((col, idx) => (
                <div key={idx} className="min-h-[100px] p-3 bg-sky-50/50 border border-dashed border-sky-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 pb-1 border-b border-sky-100">
                    <span>Column {idx + 1}</span>
                    {onAddNestedComponent && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNestedComponent(id, 'image', idx);
                          }}
                          className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                        >
                          + Image
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNestedComponent(id, 'paragraph', idx);
                          }}
                          className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                        >
                          + Text
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNestedComponent(id, 'button', idx);
                          }}
                          className="px-1.5 py-0.5 rounded bg-sky-100 text-blue-800 hover:bg-sky-200 text-[9px]"
                        >
                          + Button
                        </button>
                      </div>
                    )}
                  </div>

                  {col.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <p className="text-[10px] text-slate-400">Empty Column {idx + 1}</p>
                      {onAddNestedComponent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNestedComponent(id, 'paragraph', idx);
                          }}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-semibold"
                        >
                          + Add Text / Image
                        </button>
                      )}
                    </div>
                  ) : (
                    col.map((child) => (
                      <CanvasComponent
                        key={child.id}
                        component={child}
                        isSelected={selectedId === child.id}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onUpdateComponent={onUpdateComponent}
                        onDeleteComponent={onDeleteComponent}
                        onDuplicateComponent={onDuplicateComponent}
                        onMoveComponent={onMoveComponent}
                        onSaveReusableBlock={onSaveReusableBlock}
                        onOpenImageModal={onOpenImageModal}
                        onAddNestedComponent={onAddNestedComponent}
                        theme={activeTheme}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'social_icons': {
        const links = props.socialLinks || [
          { platform: 'Facebook', url: 'https://facebook.com' },
          { platform: 'Twitter', url: 'https://twitter.com' },
          { platform: 'Instagram', url: 'https://instagram.com' },
          { platform: 'LinkedIn', url: 'https://linkedin.com' },
          { platform: 'YouTube', url: 'https://youtube.com' },
        ];
        return (
          <div style={{ textAlign: styles.textAlign || 'center' }} className="py-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    backgroundColor: activeTheme.contentBackground,
                    borderColor: activeTheme.border,
                    color: activeTheme.primary,
                  }}
                  className="p-2.5 rounded-xl border flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                >
                  {getSocialIcon(link.platform)}
                  <span className="text-xs font-bold capitalize">{link.platform}</span>
                </a>
              ))}
            </div>
          </div>
        );
      }

      case 'product_card':
        return (
          <div
            style={{ borderColor: activeTheme.border }}
            className="bg-white rounded-2xl border overflow-hidden p-4 space-y-3 shadow-md relative group/card"
          >
            <div className="relative overflow-hidden rounded-xl bg-slate-100 group/prodimg">
              <img
                src={props.src || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
                alt={props.productName || 'Product'}
                className="w-full h-44 object-cover rounded-xl"
              />
              <button
                onClick={() => onOpenImageModal && onOpenImageModal(component)}
                className="absolute inset-0 bg-slate-900/40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover/prodimg:opacity-100 transition-opacity"
              >
                <ImageIcon className="w-4 h-4" /> Change Image
              </button>
            </div>

            <div className="space-y-1.5">
              <h4
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateComponent(id, { productName: e.currentTarget.textContent || '' }, {})}
                style={{ color: activeTheme.heading }}
                className="font-bold text-base outline-none focus:bg-sky-50 px-1 rounded"
              >
                {props.productName || 'Product Title'}
              </h4>
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateComponent(id, { productDesc: e.currentTarget.textContent || '' }, {})}
                style={{ color: activeTheme.text }}
                className="text-xs outline-none focus:bg-sky-50 px-1 rounded"
              >
                {props.productDesc || 'High quality product designed for maximum performance.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sky-100">
              <div className="flex items-baseline gap-2">
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateComponent(id, { price: e.currentTarget.textContent || '' }, {})}
                  style={{ color: activeTheme.primary }}
                  className="text-base font-extrabold outline-none focus:bg-sky-50 px-1 rounded"
                >
                  {props.price || '$49.99'}
                </span>
                {props.originalPrice && (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateComponent(id, { originalPrice: e.currentTarget.textContent || '' }, {})}
                    style={{ color: activeTheme.mutedText }}
                    className="text-xs line-through outline-none focus:bg-sky-50 px-1 rounded"
                  >
                    {props.originalPrice}
                  </span>
                )}
              </div>

              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateComponent(id, { content: e.currentTarget.textContent || '' }, {})}
                style={{ backgroundColor: activeTheme.button, color: activeTheme.buttonText }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer outline-none"
              >
                {props.content || 'Buy Now →'}
              </span>
            </div>
          </div>
        );

      case 'announcement_bar':
        return (
          <div
            style={{
              backgroundColor: styles.backgroundColor || '#2563EB',
              color: styles.color || '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {props.content || 'Announcement Bar'}
          </div>
        );

      case 'custom_html':
        return (
          <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 text-xs text-slate-800 font-mono overflow-x-auto">
            {props.htmlRaw || '<!-- Custom HTML -->'}
          </div>
        );

      default:
        return <div className="p-2 text-xs text-slate-700">{props.content || type}</div>;
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group transition-all duration-200 rounded-xl p-2 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-sky-50/40 shadow-sm'
          : isHovered
          ? 'ring-1 ring-sky-300 bg-sky-50/20'
          : 'hover:bg-sky-50/10'
      }`}
    >
      {/* Floating Toolbar */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-3.5 right-3 z-30 bg-slate-900 text-white rounded-lg shadow-lg px-2 py-1 flex items-center gap-1.5 text-[11px] animate-fade-in">
          <span className="font-bold uppercase tracking-wider text-[9px] text-sky-300 mr-1">{type}</span>
          <button onClick={() => onMoveComponent(id, 'up')} title="Move Up" className="p-1 hover:text-sky-300">
            <ArrowUp className="w-3 h-3" />
          </button>
          <button onClick={() => onMoveComponent(id, 'down')} title="Move Down" className="p-1 hover:text-sky-300">
            <ArrowDown className="w-3 h-3" />
          </button>
          <button onClick={() => onDuplicateComponent(id)} title="Duplicate" className="p-1 hover:text-sky-300">
            <Copy className="w-3 h-3" />
          </button>
          {onSaveReusableBlock && (
            <button onClick={() => onSaveReusableBlock(component)} title="Save Block" className="p-1 hover:text-amber-300">
              <Bookmark className="w-3 h-3" />
            </button>
          )}
          <button onClick={() => onDeleteComponent(id)} title="Delete" className="p-1 hover:text-rose-400">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

