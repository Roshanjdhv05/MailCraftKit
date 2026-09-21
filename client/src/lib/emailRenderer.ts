import { EmailDocument, EmailComponent, ComponentStyles } from '../types/builder';

export const DEFAULT_THEME = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  heading: '#111827',
  text: '#374151',
  background: '#F8FAFC',
  contentBackground: '#FFFFFF',
  button: '#2563EB',
  buttonText: '#FFFFFF',
  border: '#E2E8F0',
  mutedText: '#64748B',
};

const compileStyles = (styles: ComponentStyles): string => {
  const cssObj: Record<string, string> = {};

  if (styles.fontFamily) cssObj['font-family'] = styles.fontFamily;
  if (styles.fontSize) cssObj['font-size'] = styles.fontSize;
  if (styles.fontWeight) cssObj['font-weight'] = styles.fontWeight;
  if (styles.fontStyle) cssObj['font-style'] = styles.fontStyle;
  if (styles.textDecoration) cssObj['text-decoration'] = styles.textDecoration;
  if (styles.textAlign) cssObj['text-align'] = styles.textAlign;
  if (styles.textTransform) cssObj['text-transform'] = styles.textTransform;
  if (styles.color) cssObj['color'] = styles.color;
  if (styles.backgroundColor) cssObj['background-color'] = styles.backgroundColor;
  if (styles.lineHeight) cssObj['line-height'] = styles.lineHeight;
  if (styles.letterSpacing) cssObj['letter-spacing'] = styles.letterSpacing;
  if (styles.paddingTop) cssObj['padding-top'] = styles.paddingTop;
  if (styles.paddingRight) cssObj['padding-right'] = styles.paddingRight;
  if (styles.paddingBottom) cssObj['padding-bottom'] = styles.paddingBottom;
  if (styles.paddingLeft) cssObj['padding-left'] = styles.paddingLeft;
  if (styles.marginTop) cssObj['margin-top'] = styles.marginTop;
  if (styles.marginRight) cssObj['margin-right'] = styles.marginRight;
  if (styles.marginBottom) cssObj['margin-bottom'] = styles.marginBottom;
  if (styles.marginLeft) cssObj['margin-left'] = styles.marginLeft;
  if (styles.borderStyle && styles.borderStyle !== 'none') {
    cssObj['border-style'] = styles.borderStyle;
    cssObj['border-width'] = styles.borderWidth || '1px';
    cssObj['border-color'] = styles.borderColor || '#cbd5e1';
  }
  if (styles.borderRadius) cssObj['border-radius'] = styles.borderRadius;
  if (styles.width) cssObj['width'] = styles.width;

  return Object.entries(cssObj)
    .map(([k, v]) => `${k}:${v};`)
    .join('');
};

const renderComponentHtml = (comp: EmailComponent, theme = DEFAULT_THEME, gifUrlMap?: Record<string, string>): string => {
  const stylesStr = compileStyles(comp.styles);
  const p = comp.props;

  switch (comp.type) {
    case 'heading':
      return `<h1 style="margin:0;color:${comp.styles.color || theme.heading};font-size:${comp.styles.fontSize || '24px'};font-weight:${comp.styles.fontWeight || '700'};text-align:${comp.styles.textAlign || 'left'};${stylesStr}">${p.content || 'Heading'}</h1>`;

    case 'paragraph':
    case 'text':
      return `<p style="margin:0;color:${comp.styles.color || theme.text};font-size:${comp.styles.fontSize || '16px'};line-height:${comp.styles.lineHeight || '1.6'};text-align:${comp.styles.textAlign || 'left'};${stylesStr}">${p.content || 'Enter your text here...'}</p>`;

    case 'button': {
      const btnBg = comp.styles.backgroundColor || theme.button;
      const btnColor = comp.styles.color || theme.buttonText;
      const href = p.url || '#';
      const target = p.openInNewWindow ? '_blank' : '_self';
      return `<div style="text-align:${comp.styles.textAlign || 'center'};padding:${comp.styles.paddingTop || '12px'} 0;"><a href="${href}" target="${target}" style="display:inline-block;background-color:${btnBg};color:${btnColor} !important;padding:12px 28px;text-decoration:none;border-radius:${comp.styles.borderRadius || '8px'};font-weight:700;font-size:${comp.styles.fontSize || '15px'};${stylesStr}">${p.content || 'Click Here'}</a></div>`;
    }

    case 'image': {
      const src = p.src || 'https://via.placeholder.com/600x200?text=MailCraft+Image';
      const alt = p.alt || 'Email Image';
      const imgTag = `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;border-radius:${comp.styles.borderRadius || '0px'};${stylesStr}" />`;
      if (p.url) {
        return `<div style="text-align:${comp.styles.textAlign || 'center'};"><a href="${p.url}" target="${p.openInNewWindow ? '_blank' : '_self'}">${imgTag}</a></div>`;
      }
      return `<div style="text-align:${comp.styles.textAlign || 'center'};">${imgTag}</div>`;
    }

    case 'divider': {
      const color = comp.styles.borderColor || theme.border;
      const width = comp.styles.width || '100%';
      return `<hr style="border:0;border-top:${comp.styles.borderWidth || '1px'} ${comp.styles.borderStyle || 'solid'} ${color};width:${width};margin:${comp.styles.marginTop || '16px'} auto;" />`;
    }

    case 'spacer': {
      const h = comp.styles.height || '24px';
      return `<div style="height:${h};line-height:${h};font-size:1px;">&nbsp;</div>`;
    }

    case 'container':
    case 'box': {
      const innerContent = (comp.children || [])
        .map((col) => col.map((child) => renderComponentHtml(child, theme, gifUrlMap)).join(''))
        .join('');
      return `<div style="background-color:${comp.styles.backgroundColor || 'transparent'};padding:${comp.styles.paddingTop || '16px'} ${comp.styles.paddingRight || '16px'} ${comp.styles.paddingBottom || '16px'} ${comp.styles.paddingLeft || '16px'};${stylesStr}">${innerContent}</div>`;
    }

    case 'columns': {
      const colGroups = comp.children || [[], []];
      const colCount = colGroups.length || 2;
      const widthPercent = Math.floor(100 / colCount);

      if (p.animateTicker) {
        if (gifUrlMap && gifUrlMap[comp.id]) {
          const gifUrl = gifUrlMap[comp.id];
          return `<div style="text-align:center;padding:10px 0;width:100%;overflow:hidden;"><img src="${gifUrl}" alt="Auto Scroll Ticker" width="560" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:8px;${stylesStr}" /></div>`;
        }

        const slides = colGroups[0] || [];
        const speed = p.animationSpeed || '20s';

        if (slides.length === 0) {
          return `<div style="padding:16px;text-align:center;color:${theme.mutedText};">Empty Ticker</div>`;
        }

        const getScrollAmount = (spd: string) => {
          if (spd === '10s') return '8';
          if (spd === '40s') return '3';
          if (spd === '60s') return '2';
          return '5';
        };
        const scrollAmount = getScrollAmount(speed);

        // Render original slide cards
        const displaySlides = slides;

        const slideTds = displaySlides
          .map((slideItem) => {
            const slideInner = renderComponentHtml(slideItem, theme, gifUrlMap);
            return `<td align="left" valign="top" style="width:260px;min-width:260px;max-width:260px;padding:8px;white-space:normal;box-sizing:border-box;">${slideInner}</td>`;
          })
          .join('');

        return `<marquee behavior="scroll" direction="left" scrollamount="${scrollAmount}" loop="infinite" style="width:100%;max-width:100%;display:block;overflow:hidden;margin:0;padding:0;${stylesStr}"><div class="animate-ticker-rtl" style="display:inline-block;white-space:nowrap;width:max-content;animation:slideRightToLeft ${speed} linear infinite;-webkit-animation:slideRightToLeft ${speed} linear infinite;"><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="display:inline-table;width:max-content;border-collapse:collapse;margin:0;"><tr>${slideTds}</tr></table></div></marquee>`;
      }

      const colTds = colGroups
        .map((colItems) => {
          const colInner = colItems.map((child) => renderComponentHtml(child, theme, gifUrlMap)).join('');
          return `<td align="left" valign="top" width="${widthPercent}%" style="padding:8px;box-sizing:border-box;">${colInner}</td>`;
        })
        .join('');

      return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="${stylesStr}"><tr>${colTds}</tr></table>`;
    }

    case 'product_card': {
      const src = p.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
      return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border:1px solid ${theme.border};border-radius:12px;overflow:hidden;${stylesStr}">
        <tr><td align="center" style="padding:0;"><img src="${src}" alt="${p.productName || 'Product'}" style="width:100%;max-width:100%;height:auto;display:block;" /></td></tr>
        <tr><td align="left" style="padding:16px;">
          <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:${theme.heading};">${p.productName || 'Special Product'}</h3>
          <p style="margin:0 0 12px 0;font-size:14px;color:${theme.text};line-height:1.5;">${p.productDesc || 'High quality product designed for your daily workflow.'}</p>
          <div style="font-size:20px;font-weight:800;color:${theme.primary};margin-bottom:12px;">${p.price || '$49.99'} ${p.originalPrice ? `<span style="font-size:14px;color:${theme.mutedText};text-decoration:line-through;">${p.originalPrice}</span>` : ''}</div>
          <a href="${p.url || '#'}" target="_blank" style="display:inline-block;background-color:${theme.button};color:${theme.buttonText} !important;padding:10px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:14px;">${p.content || 'Buy Now →'}</a>
        </td></tr>
      </table>`;
    }

    case 'announcement_bar': {
      return `<div style="background:linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);color:#ffffff;padding:12px 20px;text-align:center;font-weight:700;font-size:14px;border-radius:8px;${stylesStr}">${p.content || '🎉 Special Sale! Get 20% off with promo code MAILSALE'}</div>`;
    }

    case 'social_icons': {
      const links = p.socialLinks || [
        { platform: 'Facebook', url: 'https://facebook.com' },
        { platform: 'Twitter', url: 'https://twitter.com' },
        { platform: 'Instagram', url: 'https://instagram.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
        { platform: 'YouTube', url: 'https://youtube.com' },
      ];
      const iconsHtml = links
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" style="display:inline-block;margin:0 6px;color:${theme.primary};text-decoration:none;font-weight:700;font-size:13px;padding:8px 14px;background-color:${theme.background};border-radius:8px;border:1px solid ${theme.border};">${l.platform}</a>`
        )
        .join('');
      return `<div style="text-align:${comp.styles.textAlign || 'center'};padding:16px 0;${stylesStr}">${iconsHtml}</div>`;
    }

    case 'custom_html': {
      return p.htmlRaw || '<div>Custom HTML Block</div>';
    }

    case 'footer': {
      return `<div style="padding:24px;text-align:center;font-size:12px;color:${theme.mutedText};border-top:1px solid ${theme.border};${stylesStr}">
        <p style="margin:0 0 8px 0;">&copy; 2026 {{company}}. All rights reserved.</p>
        <p style="margin:0;"><a href="{{unsubscribe_url}}" style="color:${theme.primary};text-decoration:underline;">Unsubscribe</a> | <a href="#" style="color:${theme.primary};text-decoration:underline;">View in Browser</a></p>
      </div>`;
    }

    default: {
      return `<div style="${stylesStr}">${p.content || ''}</div>`;
    }
  }
};

export const renderEmailDocumentToHtml = (doc: EmailDocument, gifUrlMap?: Record<string, string>): string => {
  const width = doc.settings.width || 600;
  const bg = doc.settings.backgroundColor || doc.theme.background || '#F8FAFC';
  const contentBg = doc.settings.contentBackgroundColor || doc.theme.contentBackground || '#FFFFFF';

  const bodyHtml = (doc.body || [])
    .map((comp) => renderComponentHtml(comp, doc.theme, gifUrlMap))
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Campaign</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${bg}; font-family: ${doc.settings.fontFamily || 'Arial, sans-serif'}; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; padding: 10px !important; }
      .email-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
    @keyframes slideRightToLeft {
      0% {
        transform: translateX(0%);
        -webkit-transform: translateX(0%);
      }
      100% {
        transform: translateX(-100%);
        -webkit-transform: translateX(-100%);
      }
    }
    @-webkit-keyframes slideRightToLeft {
      0% {
        -webkit-transform: translateX(0%);
        transform: translateX(0%);
      }
      100% {
        -webkit-transform: translateX(-100%);
        transform: translateX(-100%);
      }
    }
    .ticker-wrapper {
      overflow: hidden !important;
      width: 100% !important;
      max-width: 100% !important;
      display: block !important;
    }
    .animate-ticker-rtl {
      display: inline-block !important;
      white-space: nowrap !important;
      width: max-content !important;
      animation: slideRightToLeft 20s linear infinite !important;
      -webkit-animation: slideRightToLeft 20s linear infinite !important;
    }
    .animate-ticker-rtl:hover {
      animation-play-state: paused !important;
      -webkit-animation-play-state: paused !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: ${bg}; font-family: ${doc.settings.fontFamily || 'Arial, sans-serif'};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bg};">
    <tr>
      <td align="center" style="padding: 10px;">
        <table role="presentation" class="email-container" width="${width}" border="0" cellspacing="0" cellpadding="0" style="max-width: ${width}px; width: 100%; background-color: ${contentBg}; border-radius: 12px; border: 1px solid ${doc.theme.border || '#E2E8F0'}; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <tr>
            <td align="left" style="padding: 0;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
