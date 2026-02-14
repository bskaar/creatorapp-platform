import type { ProductData } from './types';

export function ProductCard({ product, primaryColor, siteId }: { product: ProductData; primaryColor: string; siteId: string }) {
  return (
    <a
      href={`/site/${siteId}/product/${product.id}`}
      style={{ display: 'block', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
    >
      {product.thumbnail_url ? (
        <img src={product.thumbnail_url} alt={product.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 200, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
          {'\u{1F4E6}'}
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{product.title}</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>{product.description || ''}</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryColor }}>${product.price_amount} {product.price_currency || 'USD'}</div>
      </div>
    </a>
  );
}
