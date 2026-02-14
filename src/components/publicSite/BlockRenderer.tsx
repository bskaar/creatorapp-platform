import { useState } from 'react';
import type { Block } from './types';

export function BlockRenderer({ block, primaryColor }: { block: Block; primaryColor: string }) {
  const c = block.content || {};
  const s = block.styles || {};

  switch (block.type) {
    case 'hero':
      return <HeroBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'text':
      return <TextBlock content={c} />;
    case 'image':
      return <ImageBlock content={c} />;
    case 'stats':
      return <StatsBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'features':
      return <FeaturesBlock content={c} primaryColor={primaryColor} />;
    case 'testimonial':
      return <TestimonialBlock content={c} />;
    case 'cta':
      return <CtaBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'form':
      return <FormBlock content={c} primaryColor={primaryColor} />;
    case 'pricing':
      return <PricingBlock content={c} primaryColor={primaryColor} />;
    case 'video':
      return <VideoBlock content={c} />;
    case 'gallery':
      return <GalleryBlock content={c} />;
    default:
      return null;
  }
}

function HeroBlock({ content: c, styles: s, primaryColor }: { content: any; styles: any; primaryColor: string }) {
  const overlay = s.overlay || 'rgba(10, 30, 60, 0.7)';
  const bgImage = c.backgroundImage
    ? { backgroundImage: `url(${c.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)` };
  const padding = s.padding || '100px 20px';

  return (
    <section style={{ ...bgImage, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: c.backgroundImage ? overlay : 'transparent' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: (s.textAlign || 'center') as any, padding, color: '#fff' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>{c.headline || ''}</h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', opacity: 0.92, lineHeight: 1.65, marginBottom: '2rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>{c.subheadline || ''}</p>
        {c.ctaText && (
          <a href={c.ctaUrl || '#'} style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#fff', color: primaryColor, borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            {c.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.8, color: '#334155' }} dangerouslySetInnerHTML={{ __html: c.text || '' }} />
    </section>
  );
}

function ImageBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <img src={c.url || ''} alt={c.alt || 'Image'} style={{ width: '100%', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
        {c.caption && <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>{c.caption}</p>}
      </div>
    </section>
  );
}

function StatsBlock({ content: c, styles: s, primaryColor }: { content: any; styles: any; primaryColor: string }) {
  const bg = s.backgroundColor || primaryColor;
  const isLight = bg === '#f8fafc' || bg === '#ffffff';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subColor = isLight ? '#64748b' : 'rgba(255,255,255,0.8)';

  return (
    <section style={{ background: bg, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {c.headline && <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem', color: textColor }}>{c.headline}</h2>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem' }}>
          {(c.stats || []).map((stat: any, i: number) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: textColor, marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.95rem', color: subColor }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{c.headline}</h2>
            {c.subheadline && <p style={{ fontSize: '1.15rem', color: '#64748b' }}>{c.subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {(c.features || []).map((f: any, i: number) => (
            <div key={i} style={{ padding: '2rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem', color: primaryColor }}>{f.icon && f.icon.length <= 4 ? f.icon : '\u2605'}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.65 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
            {c.avatar && <img src={c.avatar} alt={c.author || ''} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: '1.1rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.75, marginBottom: '1.25rem' }}>"{c.quote || ''}"</p>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>{c.author || ''}</p>
              {c.role && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{c.role}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ content: c, styles: s }: { content: any; styles: any; primaryColor: string }) {
  const bgColor = s.backgroundColor || '#0f172a';

  return (
    <section style={{ background: bgColor, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{c.headline || ''}</h2>
        {c.description && <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7, marginBottom: '2rem' }}>{c.description}</p>}
        {c.buttonText && (
          <a href={c.buttonUrl || '#'} style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#fff', color: bgColor, borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            {c.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function FormBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {c.headline && <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: '0.5rem' }}>{c.headline}</h2>}
        {c.description && <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>{c.description}</p>}
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        >
          {(c.fields || []).map((field: any, i: number) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.35rem' }}>
                {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.label}
                  required={field.required}
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  placeholder={field.label}
                  required={field.required}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '1rem' }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            style={{
              width: '100%', padding: '0.85rem',
              background: submitted ? '#22c55e' : primaryColor,
              color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {submitted ? (c.successMessage || 'Submitted!') : (c.submitButtonText || 'Submit')}
          </button>
        </form>
      </div>
    </section>
  );
}

function PricingBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{c.headline}</h2>
            {c.subheadline && <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '0.5rem' }}>{c.subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {(c.plans || []).map((plan: any, i: number) => (
            <div
              key={i}
              style={{
                background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
                boxShadow: `0 4px 20px rgba(0,0,0,${plan.highlighted ? 0.12 : 0.06})`,
                border: plan.highlighted ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                transform: plan.highlighted ? 'scale(1.03)' : 'none',
                position: 'relative',
              }}
            >
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: primaryColor, color: '#fff', padding: '0.25rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{plan.name}</h3>
              <div style={{ margin: '1.25rem 0 1.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a' }}>{plan.price}</span>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{plan.period || ''}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                {(plan.features || []).map((feature: string, fi: number) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.95rem', color: '#475569' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>{'\u2713'}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#enroll"
                style={{
                  display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none',
                  background: plan.highlighted ? primaryColor : '#f1f5f9',
                  color: plan.highlighted ? '#fff' : '#0f172a',
                }}
              >
                {plan.buttonText || 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {(c.headline || c.title) && <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{c.headline || c.title}</h2>}
        {c.description && <p style={{ color: '#64748b', marginBottom: '2rem' }}>{c.description}</p>}
        {c.videoUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <iframe src={c.videoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        ) : c.thumbnailUrl ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <img src={c.thumbnailUrl} alt="Video thumbnail" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', marginLeft: 4 }}>{'\u25B6'}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GalleryBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', color: '#0f172a', marginBottom: '2rem' }}>{c.headline}</h2>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {(c.images || []).map((img: any, i: number) => (
            <img key={i} src={img.url} alt={img.alt || `Gallery image ${i + 1}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
