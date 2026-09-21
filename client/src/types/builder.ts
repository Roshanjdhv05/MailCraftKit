export type ComponentType =
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'container'
  | 'box'
  | 'columns'
  | 'floating_row'
  | 'logo'
  | 'image_text'
  | 'image_gallery'
  | 'announcement_bar'
  | 'product_card'
  | 'offer_card'
  | 'coupon'
  | 'testimonial'
  | 'pricing_card'
  | 'cta_section'
  | 'social_icons'
  | 'variable'
  | 'custom_html'
  | 'footer'
  | 'unsubscribe'
  | 'view_in_browser'
  | 'shape';

export type CategoryType =
  | 'BASIC'
  | 'LAYOUT'
  | 'MEDIA'
  | 'MARKETING'
  | 'SOCIAL'
  | 'SPECIAL'
  | 'SHAPES';

export interface ComponentStyles {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  color?: string;
  backgroundColor?: string;
  lineHeight?: string;
  letterSpacing?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
  displayOnMobile?: boolean;
  displayOnDesktop?: boolean;
}

export interface ComponentProps {
  content?: string;
  src?: string;
  source?: 'upload' | 'url';
  alt?: string;
  url?: string;
  openInNewWindow?: boolean;
  columnsCount?: number;
  columnGap?: string;
  shapeType?: 'rectangle' | 'rounded' | 'circle' | 'line' | 'badge' | 'pill';
  socialLinks?: Array<{ platform: string; url: string; icon?: string }>;
  variableName?: string;
  htmlRaw?: string;
  price?: string;
  originalPrice?: string;
  couponCode?: string;
  authorName?: string;
  authorTitle?: string;
  productName?: string;
  productDesc?: string;
  animateTicker?: boolean;
  animationSpeed?: string;
}

export interface EmailComponent {
  id: string;
  type: ComponentType;
  title?: string;
  props: ComponentProps;
  styles: ComponentStyles;
  children?: EmailComponent[][]; // Array of columns or nested children arrays
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  heading: string;
  text: string;
  background: string;
  contentBackground: string;
  button: string;
  buttonText: string;
  border: string;
  mutedText: string;
}

export interface EmailDocumentSettings {
  width: number;
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: string;
}

export interface EmailDocument {
  version: number;
  settings: EmailDocumentSettings;
  theme: ThemeConfig;
  body: EmailComponent[];
}

export interface LibraryItem {
  type: ComponentType;
  label: string;
  category: CategoryType;
  iconName: string;
  defaultProps: ComponentProps;
  defaultStyles: ComponentStyles;
  defaultChildren?: EmailComponent[][];
}
