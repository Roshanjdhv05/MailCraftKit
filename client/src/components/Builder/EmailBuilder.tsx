import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Eye,
  Code,
  Save,
  Send,
  Mail,
  Download,
  Copy,
  Plus,
  Sparkles,
  Variable,
  FileCheck,
} from 'lucide-react';
import { EmailDocument, EmailComponent, ComponentType, ThemeConfig, ComponentProps, ComponentStyles } from '../../types/builder';
import { createBlankDocument, convertHtmlToVisualDocument } from '../../lib/htmlToVisualConverter';
import { renderEmailDocumentToHtml, DEFAULT_THEME } from '../../lib/emailRenderer';
import { prepareTickerGifs } from '../../lib/gifHelper';
import { ComponentSidebar } from './ComponentSidebar';
import { EmailCanvas } from './EmailCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { ImageUploaderModal } from './ImageUploaderModal';
import { ThemeEditorModal } from './ThemeEditorModal';

interface EmailBuilderProps {
  initialDocument?: EmailDocument;
  initialHtml?: string;
  templateName?: string;
  templateId?: string;
  onSave?: (doc: EmailDocument, html: string) => Promise<void>;
  onSendTest?: (html: string) => void;
  onProceedToSend?: (html: string) => void;
  onSwitchToHtmlMode?: (html: string) => void;
}

export const DYNAMIC_VARIABLES = [
  { name: 'name', label: 'User Name', tag: '{{name}}' },
  { name: 'email', label: 'Recipient Email', tag: '{{email}}' },
  { name: 'company', label: 'Company Name', tag: '{{company}}' },
  { name: 'heading', label: 'Email Heading', tag: '{{heading}}' },
  { name: 'message', label: 'Email Body Message', tag: '{{message}}' },
  { name: 'button_text', label: 'Button Text', tag: '{{button_text}}' },
  { name: 'button_url', label: 'Button Link URL', tag: '{{button_url}}' },
  { name: 'unsubscribe_url', label: 'Unsubscribe Link', tag: '{{unsubscribe_url}}' },
];

export const EmailBuilder: React.FC<EmailBuilderProps> = ({
  initialDocument,
  initialHtml,
  templateName = 'Untitled Email',
  templateId,
  onSave,
  onSendTest,
  onProceedToSend,
  onSwitchToHtmlMode,
}) => {
  const navigate = useNavigate();

  // Document state
  const [document, setDocument] = useState<EmailDocument>(() => {
    if (initialDocument) return initialDocument;
    if (initialHtml) return convertHtmlToVisualDocument(initialHtml);
    return createBlankDocument();
  });

  // Selection & UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [reusableBlocks, setReusableBlocks] = useState<Array<{ name: string; components: any[] }>>([]);

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [activeImageTargetComp, setActiveImageTargetComp] = useState<EmailComponent | null>(null);
  const [showVarDropdown, setShowVarDropdown] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<EmailDocument[]>([]);
  const [future, setFuture] = useState<EmailDocument[]>([]);

  // Push state to undo stack
  const updateDocumentWithHistory = useCallback(
    (newDoc: EmailDocument) => {
      setHistory((prev) => [...prev, document]);
      setFuture([]);
      setDocument(newDoc);
    },
    [document]
  );

  // Undo action
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    setFuture((prev) => [document, ...prev]);
    setHistory(newHistory);
    setDocument(previous);
  };

  // Redo action
  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev, document]);
    setFuture(newFuture);
    setDocument(next);
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Debounced Autosave simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 600);
    }, 1500);
    return () => clearTimeout(timer);
  }, [document]);

  // Component manipulation functions
  const handleAddComponent = (type: ComponentType, defaultProps?: ComponentProps, defaultStyles?: ComponentStyles) => {
    const newComp: EmailComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      props: defaultProps || {},
      styles: defaultStyles || {},
    };

    const updatedBody = [...document.body, newComp];
    updateDocumentWithHistory({ ...document, body: updatedBody });
    setSelectedId(newComp.id);
  };

  const handleUpdateComponent = (id: string, updatedProps: Partial<ComponentProps>, updatedStyles: Partial<ComponentStyles>) => {
    // Helper: find component by id (recursive)
    const findById = (list: EmailComponent[], targetId: string): EmailComponent | null => {
      for (const c of list) {
        if (c.id === targetId) return c;
        if (c.children) {
          for (const col of c.children) {
            const found = findById(col, targetId);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const existing = findById(document.body, id);

    // Auto-populate 4 slide boxes in one flat list (children[0]) when animateTicker is turned ON
    let autoChildren: EmailComponent[][] | undefined;
    if (
      existing?.type === 'columns' &&
      updatedProps.animateTicker === true &&
      !existing.props.animateTicker
    ) {
      const sampleSlidesData = [
        {
          title: 'Fragments | Berloni Gallery',
          img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
          desc: 'Use this text to describe products, share details on availability and style, or as a space to display recent reviews or FAQs.',
        },
        {
          title: 'The British Museum',
          img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=500&auto=format&fit=crop&q=80',
          desc: 'Use this text to describe products, share details on availability and style, or as a space to display recent reviews or FAQs.',
        },
        {
          title: 'Salsali Provate Museum',
          img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80',
          desc: 'Use this text to describe products, share details on availability and style, or as a space to display recent reviews or FAQs.',
        },
      ];

      const makeSlide = (imgIdx: number): EmailComponent => {
        const item = sampleSlidesData[(imgIdx - 1) % sampleSlidesData.length];
        return {
          id: `comp_${Date.now()}_slide${imgIdx}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'box',
          props: { content: item.title },
          styles: { borderRadius: '12px', paddingTop: '12px', paddingRight: '12px', paddingBottom: '12px', paddingLeft: '12px', backgroundColor: '#ffffff' },
          children: [
            [
              {
                id: `comp_${Date.now()}_simg${imgIdx}_${Math.random().toString(36).substr(2, 4)}`,
                type: 'image',
                props: { src: item.img, alt: item.title, source: 'url' },
                styles: { borderRadius: '8px', marginBottom: '8px' },
              },
              {
                id: `comp_${Date.now()}_shd${imgIdx}_${Math.random().toString(36).substr(2, 4)}`,
                type: 'heading',
                props: { content: item.title },
                styles: { textAlign: 'left', fontWeight: '700', fontSize: '14px', marginTop: '6px', marginBottom: '4px' },
              },
              {
                id: `comp_${Date.now()}_stxt${imgIdx}_${Math.random().toString(36).substr(2, 4)}`,
                type: 'paragraph',
                props: { content: item.desc },
                styles: { textAlign: 'left', fontWeight: '400', fontSize: '11px', marginBottom: '8px' },
              },
              {
                id: `comp_${Date.now()}_sbtn${imgIdx}_${Math.random().toString(36).substr(2, 4)}`,
                type: 'button',
                props: { content: 'LEARN MORE', url: 'https://example.com' },
                styles: { backgroundColor: 'transparent', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left', paddingLeft: '0px', paddingRight: '0px', paddingTop: '4px', paddingBottom: '4px' },
              },
            ],
          ],
        };
      };

      autoChildren = [
        [makeSlide(1), makeSlide(2), makeSlide(3)],
      ];
    }

    const updateRecursive = (list: EmailComponent[]): EmailComponent[] =>
      list.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            props: { ...c.props, ...updatedProps },
            styles: { ...c.styles, ...updatedStyles },
            ...(autoChildren ? { children: autoChildren } : {}),
          };
        }
        if (c.children) {
          return {
            ...c,
            children: c.children.map((col) => updateRecursive(col)),
          };
        }
        return c;
      });

    const updatedBody = updateRecursive(document.body);
    updateDocumentWithHistory({ ...document, body: updatedBody });
  };

  const handleDeleteComponent = (id: string) => {
    const deleteRecursive = (list: EmailComponent[]): EmailComponent[] =>
      list
        .filter((c) => c.id !== id)
        .map((c) => (c.children ? { ...c, children: c.children.map((col) => deleteRecursive(col)) } : c));

    const updatedBody = deleteRecursive(document.body);
    updateDocumentWithHistory({ ...document, body: updatedBody });
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateComponent = (id: string) => {
    const findAndDuplicate = (list: EmailComponent[]): EmailComponent[] => {
      const result: EmailComponent[] = [];
      list.forEach((c) => {
        result.push(c);
        if (c.id === id) {
          const dup: EmailComponent = {
            ...JSON.parse(JSON.stringify(c)),
            id: `comp_${Date.now()}_dup`,
          };
          result.push(dup);
        }
      });
      return result;
    };

    const updatedBody = findAndDuplicate(document.body);
    updateDocumentWithHistory({ ...document, body: updatedBody });
  };

  const handleMoveComponent = (id: string, direction: 'up' | 'down') => {
    const list = [...document.body];
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    updateDocumentWithHistory({ ...document, body: list });
  };

  const handleSaveReusableBlock = (comp: EmailComponent) => {
    const blockName = prompt('Enter a name for this reusable component block:', `${comp.type} Block`);
    if (!blockName) return;
    setReusableBlocks((prev) => [...prev, { name: blockName, components: [comp] }]);
  };

  const handleAddNestedComponent = (parentId: string, type: ComponentType, columnIndex: number = 0) => {
    const newChild: EmailComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      props: {
        content: type === 'heading' ? 'Nested Heading' : type === 'button' ? 'Click Here' : type === 'image' ? '' : 'Nested text content...',
        productName: type === 'product_card' ? 'New Product' : undefined,
      },
      styles: {},
    };

    const updateRecursive = (list: EmailComponent[]): EmailComponent[] =>
      list.map((c) => {
        if (c.id === parentId) {
          const existingChildren = c.children || (c.type === 'box' || c.type === 'container' ? [[]] : [[], []]);
          const currentColumn = [...(existingChildren[columnIndex] || []), newChild];
          const updatedChildren = [...existingChildren];
          updatedChildren[columnIndex] = currentColumn;
          return { ...c, children: updatedChildren };
        }
        if (c.children) {
          return {
            ...c,
            children: c.children.map((col) => updateRecursive(col)),
          };
        }
        return c;
      });

    const updatedBody = updateRecursive(document.body);
    updateDocumentWithHistory({ ...document, body: updatedBody });
    setSelectedId(newChild.id);
  };

  // Add a new slide to a ticker columns component
  const handleAddTickerSlide = (tickerParentId: string) => {
    const slideCount = (() => {
      const findComp = (list: EmailComponent[], tid: string): EmailComponent | null => {
        for (const c of list) {
          if (c.id === tid) return c;
          if (c.children) {
            for (const col of c.children) {
              const f = findComp(col, tid);
              if (f) return f;
            }
          }
        }
        return null;
      };
      const tc = findComp(document.body, tickerParentId);
      return (tc?.children?.[0]?.length || 0) + 1;
    })();

    const newSlide: EmailComponent = {
      id: `comp_${Date.now()}_slide${slideCount}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'box',
      props: { content: `Card Title ${slideCount}` },
      styles: { borderRadius: '12px', paddingTop: '12px', paddingRight: '12px', paddingBottom: '12px', paddingLeft: '12px', backgroundColor: '#ffffff' },
      children: [
        [
          {
            id: `comp_${Date.now()}_simg${slideCount}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'image',
            props: { src: `https://picsum.photos/seed/slide${slideCount + 10}/400/400`, alt: `Card Title ${slideCount}`, source: 'url' },
            styles: { borderRadius: '8px', marginBottom: '8px' },
          },
          {
            id: `comp_${Date.now()}_shd${slideCount}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'heading',
            props: { content: `Card Title ${slideCount}` },
            styles: { textAlign: 'left', fontWeight: '700', fontSize: '14px', marginTop: '6px', marginBottom: '4px' },
          },
          {
            id: `comp_${Date.now()}_stxt${slideCount}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'paragraph',
            props: { content: 'Use this text to describe products, share details on availability and style, or as a space to display recent reviews or FAQs.' },
            styles: { textAlign: 'left', fontWeight: '400', fontSize: '11px', marginBottom: '8px' },
          },
          {
            id: `comp_${Date.now()}_sbtn${slideCount}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'button',
            props: { content: 'LEARN MORE', url: 'https://example.com' },
            styles: { backgroundColor: 'transparent', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left', paddingLeft: '0px', paddingRight: '0px', paddingTop: '4px', paddingBottom: '4px' },
          },
        ],
      ],
    };

    const addSlideRecursive = (list: EmailComponent[]): EmailComponent[] =>
      list.map((c) => {
        if (c.id === tickerParentId) {
          const existing0 = c.children?.[0] || [];
          return { ...c, children: [[...existing0, newSlide]] };
        }
        if (c.children) return { ...c, children: c.children.map((col) => addSlideRecursive(col)) };
        return c;
      });

    updateDocumentWithHistory({ ...document, body: addSlideRecursive(document.body) });
  };


  const handleAddReusableBlock = (block: { name: string; components: any[] }) => {
    const copiedComponents = JSON.parse(JSON.stringify(block.components)).map((c: any) => ({
      ...c,
      id: `comp_${Date.now()}_block`,
    }));
    const updatedBody = [...document.body, ...copiedComponents];
    updateDocumentWithHistory({ ...document, body: updatedBody });
  };

  const handleImageSelect = (src: string, source: 'upload' | 'url', alt?: string) => {
    if (activeImageTargetComp) {
      handleUpdateComponent(activeImageTargetComp.id, { src, source, alt }, {});
    } else {
      handleAddComponent('image', { src, source, alt });
    }
  };

  const handleExportHtml = async () => {
    setIsGeneratingGif(true);
    try {
      const gifUrlMap = await prepareTickerGifs(document);
      const htmlOutput = renderEmailDocumentToHtml(document, gifUrlMap);
      const blob = new Blob([htmlOutput], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '_')}_email.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error preparing ticker GIF:', err);
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleCopyHtml = async () => {
    setIsGeneratingGif(true);
    try {
      const gifUrlMap = await prepareTickerGifs(document);
      const htmlOutput = renderEmailDocumentToHtml(document, gifUrlMap);
      await navigator.clipboard.writeText(htmlOutput);
      alert('Email HTML copied to clipboard!');
    } catch (err) {
      console.error('Error preparing ticker GIF:', err);
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleSaveDoc = async () => {
    setIsGeneratingGif(true);
    try {
      const gifUrlMap = await prepareTickerGifs(document);
      const htmlOutput = renderEmailDocumentToHtml(document, gifUrlMap);
      if (onSave) {
        await onSave(document, htmlOutput);
      }
    } catch (err) {
      console.error('Error preparing ticker GIF:', err);
    } finally {
      setIsGeneratingGif(false);
    }
  };

  // Recursive search to find selected component even if nested
  const findCompById = (list: EmailComponent[], id: string | null): EmailComponent | null => {
    if (!id) return null;
    for (const c of list) {
      if (c.id === id) return c;
      if (c.children) {
        for (const col of c.children) {
          const found = findCompById(col, id);
          if (found) return found;
        }
      }
    }
    return null;
  };
  const selectedCompObj = findCompById(document.body, selectedId);
  const viewportWidths = { desktop: 600, tablet: 768, mobile: 375 };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 select-none">
      {/* Top Builder Command Bar */}
      <header className="h-14 border-b border-sky-200/80 bg-white px-4 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{templateName}</h2>
          </div>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-blue-900 border border-sky-200">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Draft'}
          </span>
        </div>

        {/* Center Controls: Undo/Redo, Viewports, Variable Picker */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-sky-100 disabled:opacity-40"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-sky-100 disabled:opacity-40"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewport Modes */}
          <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200">
            {(['desktop', 'tablet', 'mobile'] as const).map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                title={`${vp.toUpperCase()} Viewport (${viewportWidths[vp]}px)`}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewport === vp ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {vp === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                {vp === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                {vp === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Theme Engine */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-blue-900 text-xs font-semibold border border-sky-200 transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span>Theme</span>
          </button>

          {/* Variable Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVarDropdown(!showVarDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-blue-900 text-xs font-semibold border border-sky-200 transition-all"
            >
              <Variable className="w-3.5 h-3.5 text-blue-600" />
              <span>Insert Variable</span>
            </button>
            {showVarDropdown && (
              <div className="absolute top-10 right-0 w-48 bg-white border border-sky-200 rounded-xl shadow-xl p-1 z-50 text-xs">
                {DYNAMIC_VARIABLES.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => {
                      handleAddComponent('paragraph', { content: `Hello ${v.tag},` });
                      setShowVarDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">{v.label}</span>
                    <code className="text-[10px] text-blue-600 font-mono">{v.tag}</code>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Save, Export, Mode Switch, Send */}
        <div className="flex items-center gap-2">
          {onSwitchToHtmlMode && (
            <button
              disabled={isGeneratingGif}
              onClick={async () => {
                setIsGeneratingGif(true);
                try {
                  const gifUrlMap = await prepareTickerGifs(document);
                  onSwitchToHtmlMode(renderEmailDocumentToHtml(document, gifUrlMap));
                } finally {
                  setIsGeneratingGif(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all disabled:opacity-50"
            >
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span>HTML Mode</span>
            </button>
          )}

          <button
            onClick={handleExportHtml}
            disabled={isGeneratingGif}
            title="Export HTML File"
            className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={handleCopyHtml}
            disabled={isGeneratingGif}
            title="Copy Raw HTML"
            className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all disabled:opacity-50"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={handleSaveDoc}
            disabled={isGeneratingGif}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save</span>
          </button>

          {onProceedToSend && (
            <button
              disabled={isGeneratingGif}
              onClick={async () => {
                setIsGeneratingGif(true);
                try {
                  const gifUrlMap = await prepareTickerGifs(document);
                  onProceedToSend(renderEmailDocumentToHtml(document, gifUrlMap));
                } finally {
                  setIsGeneratingGif(false);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all disabled:opacity-50"
            >
              {isGeneratingGif ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingGif ? 'Generating GIF...' : 'Proceed to Send'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Panel Visual Workspace */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Panel 1: Left Component Library Sidebar */}
        <ComponentSidebar
          onAddComponent={handleAddComponent}
          reusableBlocks={reusableBlocks}
          onAddReusableBlock={handleAddReusableBlock}
        />

        {/* Panel 2: Center Email Canvas */}
        <EmailCanvas
          document={document}
          selectedComponentId={selectedId}
          onSelectComponent={setSelectedId}
          onAddComponent={handleAddComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onDuplicateComponent={handleDuplicateComponent}
          onMoveComponent={handleMoveComponent}
          onSaveReusableBlock={handleSaveReusableBlock}
          onAddNestedComponent={handleAddNestedComponent}
          onOpenImageModal={(comp) => {
            setActiveImageTargetComp(comp);
            setIsImageModalOpen(true);
          }}
          viewportWidth={viewportWidths[viewport]}
          theme={document.theme}
        />

        {/* Panel 3: Right Contextual Properties Panel */}
        <PropertiesPanel
          selectedComponent={selectedCompObj}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onDuplicateComponent={handleDuplicateComponent}
          onMoveComponent={handleMoveComponent}
          onOpenImageModal={(comp) => {
            if (comp) setActiveImageTargetComp(comp);
            setIsImageModalOpen(true);
          }}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onAddTickerSlide={handleAddTickerSlide}
        />
      </div>

      {/* Modals */}
      <ImageUploaderModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setActiveImageTargetComp(null);
        }}
        onSelectImage={handleImageSelect}
        initialAlt={activeImageTargetComp?.props.alt}
        initialUrl={activeImageTargetComp?.props.src}
      />

      <ThemeEditorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        theme={document.theme}
        onUpdateTheme={(newTheme) => updateDocumentWithHistory({ ...document, theme: newTheme })}
      />
    </div>
  );
};
