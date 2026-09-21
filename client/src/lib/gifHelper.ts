import { EmailDocument, EmailComponent } from '../types/builder';
import { api } from './api';

export const prepareTickerGifs = async (doc: EmailDocument): Promise<Record<string, string>> => {
  const tickerComps: EmailComponent[] = [];

  const findTickers = (list: EmailComponent[]) => {
    for (const comp of list) {
      if (comp.type === 'columns' && comp.props.animateTicker) {
        tickerComps.push(comp);
      }
      if (comp.children) {
        for (const group of comp.children) {
          findTickers(group);
        }
      }
    }
  };

  findTickers(doc.body || []);

  if (tickerComps.length === 0) {
    return {};
  }

  const gifUrlMap: Record<string, string> = {};

  for (const comp of tickerComps) {
    const colGroups = comp.children || [[], []];
    const slides = colGroups[0] || [];

    if (slides.length === 0) continue;

    const slideData = slides.map((child) => {
      const slideItems = child.children?.[0] || [];
      const imgComp = slideItems.find((c) => c.type === 'image');
      const headingComp = slideItems.find((c) => c.type === 'heading');
      const textComp = slideItems.find((c) => c.type === 'paragraph' || c.type === 'text');
      const btnComp = slideItems.find((c) => c.type === 'button');

      return {
        imgSrc: imgComp?.props.src || child.props.src,
        title: headingComp?.props.content || child.props.content,
        desc: textComp?.props.content || child.props.productDesc,
        btnText: btnComp?.props.content || 'LEARN MORE',
        btnColor: btnComp?.styles?.backgroundColor || doc.theme?.button || '#2563EB',
        bgColor: child.styles?.backgroundColor || doc.theme?.contentBackground || '#ffffff',
      };
    });

    try {
      const res = await api.generateTickerGif({
        slides: slideData,
        animationSpeed: comp.props.animationSpeed || '20s',
        backgroundColor: comp.styles?.backgroundColor || doc.theme?.background || '#f8fafc',
        width: 560,
        height: 280,
      });

      if (res.success && res.data?.url) {
        gifUrlMap[comp.id] = res.data.url;
      }
    } catch (err) {
      console.error('Failed to generate GIF for ticker component:', comp.id, err);
    }
  }

  return gifUrlMap;
};
