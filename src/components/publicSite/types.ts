export interface BrandTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  neutralColor: string;
  backgroundColor: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
}

export interface SiteData {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  brand_theme?: BrandTheme | null;
  settings: any;
  logo_url?: string | null;
  favicon_url?: string | null;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: any;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  page_type: string | null;
  funnel_id?: string | null;
}

export interface ProductData {
  id: string;
  title: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  thumbnail_url: string | null;
  product_type: string;
}

export interface Block {
  id: string;
  type: string;
  content: any;
  styles?: any;
}
