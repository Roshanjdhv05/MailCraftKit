import { DEFAULT_THEME } from './emailRenderer';
import { EmailDocument, EmailComponent } from '../types/builder';

export const createBlankDocument = (): EmailDocument => ({
  version: 1,
  settings: {
    width: 600,
    backgroundColor: '#F8FAFC',
    contentBackgroundColor: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  theme: { ...DEFAULT_THEME },
  body: [
    {
      id: `comp_${Date.now()}_1`,
      type: 'heading',
      props: { content: 'Welcome to MailCraft' },
      styles: {
        fontSize: '28px',
        fontWeight: '700',
        textAlign: 'center',
        paddingTop: '24px',
        paddingBottom: '12px',
      },
    },
    {
      id: `comp_${Date.now()}_2`,
      type: 'paragraph',
      props: {
        content:
          'This is your new visual email canvas. Drag components from the left sidebar to build your campaign.',
      },
      styles: {
        fontSize: '16px',
        textAlign: 'center',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '20px',
      },
    },
    {
      id: `comp_${Date.now()}_3`,
      type: 'button',
      props: { content: 'Explore Features →', url: 'https://example.com' },
      styles: {
        textAlign: 'center',
        borderRadius: '8px',
        fontSize: '15px',
        paddingTop: '12px',
        paddingBottom: '24px',
      },
    },
  ],
});

export const convertHtmlToVisualDocument = (rawHtml: string): EmailDocument => {
  if (!rawHtml || !rawHtml.trim()) {
    return createBlankDocument();
  }

  // Create a base document model wrapping the imported HTML
  const doc: EmailDocument = {
    version: 1,
    settings: {
      width: 600,
      backgroundColor: '#F8FAFC',
      contentBackgroundColor: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    },
    theme: { ...DEFAULT_THEME },
    body: [],
  };

  // Simple parser to extract body content or wrap as custom_html block
  try {
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(rawHtml, 'text/html');
    const bodyChildren = Array.from(parsedDoc.body.children);

    if (bodyChildren.length === 0 && parsedDoc.body.innerHTML.trim()) {
      doc.body.push({
        id: `comp_${Date.now()}_0`,
        type: 'custom_html',
        props: { htmlRaw: parsedDoc.body.innerHTML },
        styles: { paddingTop: '16px', paddingBottom: '16px' },
      });
      return doc;
    }

    bodyChildren.forEach((node, idx) => {
      const tagName = node.tagName.toLowerCase();
      const textContent = node.textContent?.trim() || '';

      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'heading',
          props: { content: textContent || 'Heading' },
          styles: {
            fontSize: tagName === 'h1' ? '28px' : tagName === 'h2' ? '22px' : '18px',
            fontWeight: '700',
            textAlign: 'left',
            paddingTop: '16px',
            paddingBottom: '8px',
          },
        });
      } else if (tagName === 'p') {
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'paragraph',
          props: { content: textContent },
          styles: {
            fontSize: '16px',
            textAlign: 'left',
            paddingTop: '8px',
            paddingBottom: '8px',
          },
        });
      } else if (tagName === 'img') {
        const img = node as HTMLImageElement;
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'image',
          props: { src: img.src, alt: img.alt || 'Image', source: 'url' },
          styles: { textAlign: 'center', paddingTop: '12px', paddingBottom: '12px' },
        });
      } else if (tagName === 'a' && node.getAttribute('style')?.includes('background')) {
        const a = node as HTMLAnchorElement;
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'button',
          props: { content: textContent, url: a.href },
          styles: { textAlign: 'center', paddingTop: '12px', paddingBottom: '12px' },
        });
      } else if (tagName === 'hr') {
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'divider',
          props: {},
          styles: { marginTop: '16px', marginBottom: '16px' },
        });
      } else {
        // Fallback for complex tables/divs: wrap in custom_html component
        doc.body.push({
          id: `comp_${Date.now()}_${idx}`,
          type: 'custom_html',
          props: { htmlRaw: node.outerHTML },
          styles: { paddingTop: '8px', paddingBottom: '8px' },
        });
      }
    });

    if (doc.body.length === 0) {
      doc.body.push({
        id: `comp_${Date.now()}_fallback`,
        type: 'custom_html',
        props: { htmlRaw: rawHtml },
        styles: { paddingTop: '16px', paddingBottom: '16px' },
      });
    }

    return doc;
  } catch (err) {
    // Safety net: wrap full raw HTML into a custom_html component
    return {
      ...doc,
      body: [
        {
          id: `comp_${Date.now()}_err`,
          type: 'custom_html',
          props: { htmlRaw: rawHtml },
          styles: { paddingTop: '16px', paddingBottom: '16px' },
        },
      ],
    };
  }
};
