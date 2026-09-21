import React, { useState } from 'react';
import { Plus, MoveDown } from 'lucide-react';
import { EmailDocument, EmailComponent, ComponentType, ThemeConfig } from '../../types/builder';
import { CanvasComponent } from './CanvasComponent';
import { DEFAULT_THEME } from '../../lib/emailRenderer';

interface EmailCanvasProps {
  document: EmailDocument;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onAddComponent: (type: ComponentType, props?: any, styles?: any) => void;
  onUpdateComponent: (id: string, updatedProps: any, updatedStyles: any) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
  onSaveReusableBlock?: (comp: EmailComponent) => void;
  onOpenImageModal?: (comp: EmailComponent) => void;
  onAddNestedComponent?: (parentId: string, childType: ComponentType, columnIndex?: number) => void;
  viewportWidth?: number; // 600, 768, 375
  theme?: ThemeConfig;
}

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
  document,
  selectedComponentId,
  onSelectComponent,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onSaveReusableBlock,
  onOpenImageModal,
  onAddNestedComponent,
  viewportWidth = 600,
  theme,
}) => {
  const activeTheme = theme || document.theme || DEFAULT_THEME;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const type = e.dataTransfer.getData('text/plain') as ComponentType;
      const jsonStr = e.dataTransfer.getData('application/json');
      if (jsonStr) {
        const item = JSON.parse(jsonStr);
        onAddComponent(item.type, item.defaultProps, item.defaultStyles);
      } else if (type) {
        onAddComponent(type);
      }
    } catch (err) {
      console.warn('Drop parse error:', err);
    }
  };

  const { settings, body } = document;

  return (
    <div
      onClick={() => onSelectComponent(null)}
      style={{ backgroundColor: activeTheme.background || '#F8FAFC' }}
      className="flex-1 h-full min-h-0 p-6 pb-32 overflow-y-auto flex flex-col items-center select-none transition-colors duration-300"
    >
      {/* 600px Email Frame */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: `${viewportWidth}px`,
          maxWidth: '100%',
          backgroundColor: settings.contentBackgroundColor || activeTheme.contentBackground || '#FFFFFF',
          borderRadius: '16px',
          borderColor: activeTheme.border || '#E2E8F0',
        }}
        className={`transition-all duration-300 border shadow-xl rounded-2xl overflow-hidden relative min-h-[550px] p-6 space-y-4 my-6 shrink-0 ${
          isDragOver ? 'ring-4 ring-blue-500/40 border-blue-600 scale-[1.005]' : ''
        }`}
      >
        {/* Drop indicator banner when dragging */}
        {isDragOver && (
          <div className="absolute inset-x-0 top-0 z-40 bg-blue-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-pulse">
            <MoveDown className="w-4 h-4 animate-bounce" />
            <span>Drop Component Here to Insert into Email</span>
          </div>
        )}

        {body.length === 0 ? (
          <div className="h-96 border-2 border-dashed border-sky-300 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-sky-50/50 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Email Canvas is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Drag components from the Left Library or click buttons to start designing your email.
              </p>
            </div>
            <button
              onClick={() => onAddComponent('heading', { content: 'Welcome to MailCraft' })}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
            >
              Add First Heading
            </button>
          </div>
        ) : (
          body.map((comp) => (
            <CanvasComponent
              key={comp.id}
              component={comp}
              isSelected={selectedComponentId === comp.id}
              selectedId={selectedComponentId}
              onSelect={onSelectComponent}
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
    </div>
  );
};
