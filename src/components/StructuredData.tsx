import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface SoftwareApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  applicationCategory: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    priceValidUntil: string;
  };
  aggregateRating: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
  description: string;
}

interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

interface ProductSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

type StructuredDataSchema = OrganizationSchema | SoftwareApplicationSchema | FAQSchema | ProductSchema | object;

interface StructuredDataProps {
  data: StructuredDataSchema;
  id?: string;
}

export default function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data, id]);

  return null;
}

export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CreatorApp',
  url: 'https://www.creatorapp.us',
  logo: 'https://www.creatorapp.us/creatorapp-c1-logo-gradient.svg',
  description: 'The all-in-one AI-powered platform for creator businesses. Build online courses, create sales funnels, manage email marketing, and grow your digital business with AI-powered tools.',
  sameAs: []
};

export const softwareApplicationSchema: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CreatorApp',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '49',
    priceCurrency: 'USD',
    priceValidUntil: '2026-12-31'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '247'
  },
  description: 'All-in-one creator platform with AI Co-Founder. Create courses, build funnels, automate email marketing, and scale your creator business with Claude AI-powered tools.'
};

export const faqSchema: FAQSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the free trial work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All paid plans include a 14-day free trial. Credit card required, but you won\'t be charged until the trial ends. Cancel anytime during the trial at no cost.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I change plans later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! Upgrade or downgrade anytime. Changes take effect immediately with prorated billing adjustments.'
      }
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all major credit cards through Stripe for secure processing.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does CreatorApp take a percentage of my sales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, CreatorApp does not take any percentage of your revenue. You only pay your monthly subscription fee. Standard Stripe transaction fees apply.'
      }
    }
  ]
};
