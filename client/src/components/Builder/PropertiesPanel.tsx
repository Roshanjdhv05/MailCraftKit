import React from 'react';
import { Sliders, Palette, Type, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Link as LinkIcon, Trash2, Copy, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { EmailComponent, ComponentStyles, ComponentProps } from '../../types/builder';

interface PropertiesPanelProps {
  selectedComponent: EmailComponent | null;
  onUpdateComponent: (id: string, updatedProps: Partial<ComponentProps>, updatedStyles: Partial<ComponentStyles>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
  onOpenImageModal: (comp?: EmailComponent) => void;
  onOpenThemeModal: () => void;
  onAddTickerSlide?: (parentId: string) => void;
}

export const SAFE_EMAIL_FONTS = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Times New Roman, serif',
  'Courier New, monospace',
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onOpenImageModal,
  onOpenThemeModal,
  onAddTickerSlide,
}) => {
  if (!selectedComponent) {
    return (
      <aside className="w-72 bg-white border-l border-sky-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 mx-auto">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Properties Panel</h3>
          <p className="text-xs text-slate-500 mt-1">Select any component on the canvas to inspect and edit typography, styles, colors, and links.</p>
        </div>
        <button
          onClick={onOpenThemeModal}
          className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-blue-900 text-xs font-semibold border border-sky-200 flex items-center justify-center gap-2 transition-all"
        >
          <Palette className="w-4 h-4 text-blue-600" />
          <span>Global Theme Engine</span>
        </button>
      </aside>
    );
  }

  const { id, type, props, styles } = selectedComponent;

  const handlePropChange = (key: keyof ComponentProps, val: any) => {
    onUpdateComponent(id, { [key]: val }, {});
  };

  const handleStyleChange = (key: keyof ComponentStyles, val: any) => {
    onUpdateComponent(id, {}, { [key]: val });
  };

  return (
    <aside className="w-72 bg-white border-l border-sky-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto p-4 space-y-5 shadow-sm text-xs">
      {/* Component Title & Quick Actions */}
      <div className="pb-3 border-b border-sky-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">Selected Element</span>
          <h3 className="text-sm font-bold text-slate-900 capitalize">{type.replace(/_/g, ' ')}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMoveComponent(id, 'up')} title="Move Up" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-sky-50 rounded-lg">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMoveComponent(id, 'down')} title="Move Down" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-sky-50 rounded-lg">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDuplicateComponent(id)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-sky-50 rounded-lg">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDeleteComponent(id)} title="Delete" className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. CONTENT EDITING */}
      {['heading', 'paragraph', 'text', 'button', 'announcement_bar'].includes(type) && (
        <div className="space-y-2">
          <label className="block text-slate-700 font-semibold uppercase text-[11px]">Text Content</label>
          {type === 'paragraph' ? (
            <textarea
              rows={4}
              value={props.content || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
            />
          ) : (
            <input
              type="text"
              value={props.content || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
            />
          )}
        </div>
      )}

      {/* 2. IMAGE COMPONENT SPECIFIC */}
      {type === 'image' && (
        <div className="space-y-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200">
          <label className="block text-slate-900 font-bold uppercase text-[11px] flex items-center justify-between">
            <span>Image Source</span>
            <span className="text-[10px] text-blue-600 font-mono font-semibold">{props.source || 'url'}</span>
          </label>
          <button
            onClick={() => onOpenImageModal(selectedComponent)}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload or Change Image</span>
          </button>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Alt Text</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => handlePropChange('alt', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Clickable Link URL</label>
            <input
              type="url"
              value={props.url || ''}
              onChange={(e) => handlePropChange('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
            />
          </div>
        </div>
      )}

      {/* 3. BUTTON URL */}
      {type === 'button' && (
        <div className="space-y-2">
          <label className="block text-slate-700 font-semibold uppercase text-[11px]">Button Link URL</label>
          <input
            type="url"
            value={props.url || ''}
            onChange={(e) => handlePropChange('url', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>
      )}

      {/* 3B. COLUMNS ANIMATION + CONTENTS */}
      {type === 'columns' && (
        <div className="space-y-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200">
          <label className="block text-slate-900 font-bold uppercase text-[11px] flex items-center justify-between">
            <span>Column Animation</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          </label>
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-sky-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Right to Left Auto-Slide</p>
              <p className="text-[10px] text-slate-500">Smooth continuous marquee ticker without delay</p>
            </div>
            <input
              type="checkbox"
              checked={!!props.animateTicker}
              onChange={(e) => handlePropChange('animateTicker', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {props.animateTicker && (
            <div>
              <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Animation Speed</label>
              <select
                value={props.animationSpeed || '20s'}
                onChange={(e) => handlePropChange('animationSpeed', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
              >
                <option value="10s">Fast (10s)</option>
                <option value="20s">Normal (20s)</option>
                <option value="40s">Slow (40s)</option>
                <option value="60s">Very Slow (60s)</option>
              </select>
            </div>
          )}

          {props.animateTicker ? (
            <div className="space-y-3 pt-2 border-t border-sky-200">
              <div className="flex items-center justify-between">
                <label className="block text-slate-900 font-bold uppercase text-[11px]">
                  Ticker Slides ({selectedComponent.children?.[0]?.length || 0})
                </label>
                {onAddTickerSlide && (
                  <button
                    type="button"
                    onClick={() => onAddTickerSlide(id)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                  >
                    + Add Box / Slide
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(selectedComponent.children?.[0] || []).map((slide, slideIdx) => {
                  const slideItems = slide.children?.[0] || [];
                  const imgComp = slideItems.find((c) => c.type === 'image');
                  const headingComp = slideItems.find((c) => c.type === 'heading');
                  const textComp = slideItems.find((c) => c.type === 'paragraph' || c.type === 'text');
                  const btnComp = slideItems.find((c) => c.type === 'button');

                  return (
                    <div key={slide.id} className="bg-white p-3 rounded-xl border border-sky-200 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-sky-100 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-extrabold">{slideIdx + 1}</span>
                          <span>Card Slide {slideIdx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteComponent(slide.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 1. Image editor */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase flex items-center justify-between">
                          <span>Image URL</span>
                          {imgComp && (
                            <button
                              type="button"
                              onClick={() => onOpenImageModal(imgComp)}
                              className="text-blue-600 hover:underline text-[9px] lowercase font-bold"
                            >
                              Choose Image
                            </button>
                          )}
                        </label>
                        <input
                          type="url"
                          value={imgComp?.props.src || ''}
                          onChange={(e) => {
                            if (imgComp) {
                              onUpdateComponent(imgComp.id, { src: e.target.value }, {});
                            }
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>

                      {/* 2. Heading / Title editor */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase">Title / Heading</label>
                        <input
                          type="text"
                          value={headingComp?.props.content || slide.props.content || ''}
                          onChange={(e) => {
                            if (headingComp) {
                              onUpdateComponent(headingComp.id, { content: e.target.value }, {});
                            } else {
                              onUpdateComponent(slide.id, { content: e.target.value }, {});
                            }
                          }}
                          placeholder="Enter title (e.g. Fragments | Berloni Gallery)..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        />
                      </div>

                      {/* 3. Description / Text editor */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase">Description / Text</label>
                        <textarea
                          rows={2}
                          value={textComp?.props.content || ''}
                          onChange={(e) => {
                            if (textComp) {
                              onUpdateComponent(textComp.id, { content: e.target.value }, {});
                            }
                          }}
                          placeholder="Enter description text..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {/* 4. Button & Link editor */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase">Button &amp; Link</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={btnComp?.props.content || 'LEARN MORE'}
                            onChange={(e) => {
                              if (btnComp) {
                                onUpdateComponent(btnComp.id, { content: e.target.value }, {});
                              }
                            }}
                            placeholder="LEARN MORE"
                            className="w-full px-2 py-1 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs font-bold uppercase"
                          />
                          <input
                            type="url"
                            value={btnComp?.props.url || ''}
                            onChange={(e) => {
                              if (btnComp) {
                                onUpdateComponent(btnComp.id, { url: e.target.value }, {});
                              }
                            }}
                            placeholder="https://..."
                            className="w-full px-2 py-1 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            selectedComponent.children && (
              <div className="space-y-2 pt-1 border-t border-sky-100">
                <label className="block text-slate-900 font-bold uppercase text-[11px]">Column Contents</label>
                {selectedComponent.children.map((col, colIdx) => (
                  <div key={colIdx} className="bg-white p-2 rounded-xl border border-sky-200">
                    <p className="text-[10px] font-bold text-blue-700 mb-1">Column {colIdx + 1} — {col.length} item{col.length !== 1 ? 's' : ''}</p>
                    {col.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">Empty — click "+ Add" buttons on the canvas</p>
                    ) : (
                      <ul className="space-y-0.5">
                        {col.map((child, childIdx) => (
                          <li key={child.id} className="flex items-center gap-1.5 text-[10px] text-slate-700">
                            <span className="w-4 h-4 rounded bg-sky-100 text-blue-600 font-bold flex items-center justify-center text-[9px]">{childIdx + 1}</span>
                            <span className="capitalize font-medium">{child.type.replace(/_/g, ' ')}</span>
                            {child.props.content && <span className="text-slate-400 truncate max-w-[100px]">— {child.props.content}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* 3C. SOCIAL ICONS LINKS */}
      {type === 'social_icons' && (
        <div className="space-y-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200">
          <label className="block text-slate-900 font-bold uppercase text-[11px]">Social Media Links</label>
          <p className="text-[10px] text-slate-500">Edit target URLs for social media icons connected in email</p>
          {(
            props.socialLinks || [
              { platform: 'Facebook', url: 'https://facebook.com' },
              { platform: 'Twitter', url: 'https://twitter.com' },
              { platform: 'Instagram', url: 'https://instagram.com' },
              { platform: 'LinkedIn', url: 'https://linkedin.com' },
              { platform: 'YouTube', url: 'https://youtube.com' },
            ]
          ).map((item, idx) => (
            <div key={idx} className="space-y-1 bg-white p-2 rounded-xl border border-sky-200">
              <label className="block text-[10px] font-bold text-slate-700 capitalize">{item.platform} URL</label>
              <input
                type="url"
                value={item.url || ''}
                onChange={(e) => {
                  const updated = [...(props.socialLinks || [
                    { platform: 'Facebook', url: 'https://facebook.com' },
                    { platform: 'Twitter', url: 'https://twitter.com' },
                    { platform: 'Instagram', url: 'https://instagram.com' },
                    { platform: 'LinkedIn', url: 'https://linkedin.com' },
                    { platform: 'YouTube', url: 'https://youtube.com' },
                  ])];
                  updated[idx] = { ...updated[idx], url: e.target.value };
                  handlePropChange('socialLinks', updated);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* 3D. PRODUCT CARD EDITING */}
      {type === 'product_card' && (
        <div className="space-y-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200">
          <label className="block text-slate-900 font-bold uppercase text-[11px]">Product Card Details</label>

          <button
            onClick={() => onOpenImageModal(selectedComponent)}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Product Image</span>
          </button>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Image URL</label>
            <input
              type="text"
              value={props.src || ''}
              onChange={(e) => handlePropChange('src', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Product Title</label>
            <input
              type="text"
              value={props.productName || ''}
              onChange={(e) => handlePropChange('productName', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={props.productDesc || ''}
              onChange={(e) => handlePropChange('productDesc', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Price</label>
              <input
                type="text"
                value={props.price || ''}
                onChange={(e) => handlePropChange('price', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-blue-600 font-extrabold text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Original Price</label>
              <input
                type="text"
                value={props.originalPrice || ''}
                onChange={(e) => handlePropChange('originalPrice', e.target.value)}
                placeholder="$199.99"
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-400 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Button Text</label>
            <input
              type="text"
              value={props.content || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-[10px] uppercase mb-1">Button Link URL</label>
            <input
              type="url"
              value={props.url || ''}
              onChange={(e) => handlePropChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs"
            />
          </div>
        </div>
      )}

      {/* 4. TYPOGRAPHY */}
      <div className="space-y-3 pt-2 border-t border-sky-100">
        <label className="block text-slate-900 font-bold uppercase text-[11px] flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-blue-600" />
          <span>Typography</span>
        </label>

        <div>
          <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Font Family</label>
          <select
            value={styles.fontFamily || 'Arial, sans-serif'}
            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
          >
            {SAFE_EMAIL_FONTS.map((f) => (
              <option key={f} value={f}>{f.split(',')[0]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Font Size</label>
            <input
              type="text"
              value={styles.fontSize || '16px'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Weight</label>
            <select
              value={styles.fontWeight || '400'}
              onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
            >
              <option value="400">Normal</option>
              <option value="600">Medium</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Alignment</label>
          <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleStyleChange('textAlign', align)}
                className={`flex-1 py-1 rounded-lg flex items-center justify-center capitalize ${
                  styles.textAlign === align ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. COLORS */}
      <div className="space-y-3 pt-2 border-t border-sky-100">
        <label className="block text-slate-900 font-bold uppercase text-[11px] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>Colors</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Text Color</label>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-sky-50/50 border border-sky-200">
              <input
                type="color"
                value={styles.color || '#111827'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer p-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-700">{styles.color || '#111827'}</span>
            </div>
          </div>
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Background</label>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-sky-50/50 border border-sky-200">
              <input
                type="color"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer p-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-700">{styles.backgroundColor || 'transparent'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SPACING & BORDERS */}
      <div className="space-y-3 pt-2 border-t border-sky-100">
        <label className="block text-slate-900 font-bold uppercase text-[11px]">Padding &amp; Border Radius</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Padding Top</label>
            <input
              type="text"
              value={styles.paddingTop || '12px'}
              onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Padding Bottom</label>
            <input
              type="text"
              value={styles.paddingBottom || '12px'}
              onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-[10px] uppercase mb-1 font-semibold">Border Radius</label>
            <input
              type="text"
              value={styles.borderRadius || '0px'}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
