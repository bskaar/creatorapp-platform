export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          tier: 'launch' | 'growth' | 'scale'
          logo_url: string | null
          primary_color: string
          custom_domain: string | null
          domain_verification_status: 'not_verified' | 'pending' | 'verified' | 'failed'
          domain_verification_token: string | null
          domain_verified_at: string | null
          dns_records: Json
          ssl_status: 'not_provisioned' | 'provisioning' | 'active' | 'failed'
          settings: Json
          contacts_count: number
          products_count: number
          emails_sent_month: number
          status: 'active' | 'suspended' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          tier?: 'launch' | 'growth' | 'scale'
          logo_url?: string | null
          primary_color?: string
          custom_domain?: string | null
          domain_verification_status?: 'not_verified' | 'pending' | 'verified' | 'failed'
          domain_verification_token?: string | null
          domain_verified_at?: string | null
          dns_records?: Json
          ssl_status?: 'not_provisioned' | 'provisioning' | 'active' | 'failed'
          settings?: Json
          contacts_count?: number
          products_count?: number
          emails_sent_month?: number
          status?: 'active' | 'suspended' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          tier?: 'launch' | 'growth' | 'scale'
          logo_url?: string | null
          primary_color?: string
          custom_domain?: string | null
          domain_verification_status?: 'not_verified' | 'pending' | 'verified' | 'failed'
          domain_verification_token?: string | null
          domain_verified_at?: string | null
          dns_records?: Json
          ssl_status?: 'not_provisioned' | 'provisioning' | 'active' | 'failed'
          settings?: Json
          contacts_count?: number
          products_count?: number
          emails_sent_month?: number
          status?: 'active' | 'suspended' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      site_members: {
        Row: {
          id: string
          site_id: string
          user_id: string
          role: 'owner' | 'admin' | 'marketer' | 'support' | 'creator' | 'member'
          permissions: Json
          invited_by: string | null
          invited_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          user_id: string
          role: 'owner' | 'admin' | 'marketer' | 'support' | 'creator' | 'member'
          permissions?: Json
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'marketer' | 'support' | 'creator' | 'member'
          permissions?: Json
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          site_id: string
          title: string
          description: string | null
          product_type: 'course' | 'membership' | 'digital_product' | 'coaching'
          price_amount: number
          price_currency: string
          billing_type: 'one_time' | 'recurring'
          billing_interval: 'monthly' | 'quarterly' | 'yearly' | null
          thumbnail_url: string | null
          status: 'draft' | 'published' | 'archived'
          access_duration_days: number | null
          shopify_product_id: string | null
          paypal_product_id: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          title: string
          description?: string | null
          product_type: 'course' | 'membership' | 'digital_product' | 'coaching'
          price_amount?: number
          price_currency?: string
          billing_type?: 'one_time' | 'recurring'
          billing_interval?: 'monthly' | 'quarterly' | 'yearly' | null
          thumbnail_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          access_duration_days?: number | null
          shopify_product_id?: string | null
          paypal_product_id?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          title?: string
          description?: string | null
          product_type?: 'course' | 'membership' | 'digital_product' | 'coaching'
          price_amount?: number
          price_currency?: string
          billing_type?: 'one_time' | 'recurring'
          billing_interval?: 'monthly' | 'quarterly' | 'yearly' | null
          thumbnail_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          access_duration_days?: number | null
          shopify_product_id?: string | null
          paypal_product_id?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          product_id: string
          title: string
          description: string | null
          content_type: 'video' | 'audio' | 'text' | 'pdf' | 'quiz'
          content_text: string | null
          media_url: string | null
          media_duration_seconds: number | null
          order_index: number
          is_preview: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          description?: string | null
          content_type: 'video' | 'audio' | 'text' | 'pdf' | 'quiz'
          content_text?: string | null
          media_url?: string | null
          media_duration_seconds?: number | null
          order_index?: number
          is_preview?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          description?: string | null
          content_type?: 'video' | 'audio' | 'text' | 'pdf' | 'quiz'
          content_text?: string | null
          media_url?: string | null
          media_duration_seconds?: number | null
          order_index?: number
          is_preview?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          site_id: string
          email: string
          full_name: string | null
          phone: string | null
          status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
          custom_fields: Json
          rfm_score: number
          total_spent: number
          last_activity_at: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          email: string
          full_name?: string | null
          phone?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced' | 'complained'
          custom_fields?: Json
          rfm_score?: number
          total_spent?: number
          last_activity_at?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced' | 'complained'
          custom_fields?: Json
          rfm_score?: number
          total_spent?: number
          last_activity_at?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      funnels: {
        Row: {
          id: string
          site_id: string
          name: string
          description: string | null
          goal_type: 'lead_generation' | 'product_sale' | 'webinar_registration' | 'membership_signup' | null
          status: 'draft' | 'active' | 'paused' | 'archived'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          name: string
          description?: string | null
          goal_type?: 'lead_generation' | 'product_sale' | 'webinar_registration' | 'membership_signup' | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          name?: string
          description?: string | null
          goal_type?: 'lead_generation' | 'product_sale' | 'webinar_registration' | 'membership_signup' | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          site_id: string
          funnel_id: string | null
          title: string
          slug: string
          page_type: 'landing' | 'sales' | 'checkout' | 'thank_you' | 'webinar_registration' | 'custom'
          content: Json
          seo_title: string | null
          seo_description: string | null
          seo_image_url: string | null
          custom_css: string | null
          custom_js: string | null
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          views_count: number
          conversions_count: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          funnel_id?: string | null
          title: string
          slug: string
          page_type: 'landing' | 'sales' | 'checkout' | 'thank_you' | 'webinar_registration' | 'custom'
          content?: Json
          seo_title?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          custom_css?: string | null
          custom_js?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          conversions_count?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          funnel_id?: string | null
          title?: string
          slug?: string
          page_type?: 'landing' | 'sales' | 'checkout' | 'thank_you' | 'webinar_registration' | 'custom'
          content?: Json
          seo_title?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          custom_css?: string | null
          custom_js?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          conversions_count?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          site_id: string
          contact_id: string | null
          product_id: string | null
          order_number: string
          amount: number
          currency: string
          payment_provider: 'paypal' | 'shopify' | 'stripe' | 'manual'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          external_order_id: string | null
          external_customer_id: string | null
          payment_method: string | null
          billing_email: string | null
          billing_name: string | null
          billing_address: Json | null
          tax_amount: number
          discount_amount: number
          discount_code: string | null
          metadata: Json
          paid_at: string | null
          refunded_at: string | null
          refund_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          contact_id?: string | null
          product_id?: string | null
          order_number: string
          amount: number
          currency?: string
          payment_provider: 'paypal' | 'shopify' | 'stripe' | 'manual'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          external_order_id?: string | null
          external_customer_id?: string | null
          payment_method?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_address?: Json | null
          tax_amount?: number
          discount_amount?: number
          discount_code?: string | null
          metadata?: Json
          paid_at?: string | null
          refunded_at?: string | null
          refund_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          contact_id?: string | null
          product_id?: string | null
          order_number?: string
          amount?: number
          currency?: string
          payment_provider?: 'paypal' | 'shopify' | 'stripe' | 'manual'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          external_order_id?: string | null
          external_customer_id?: string | null
          payment_method?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_address?: Json | null
          tax_amount?: number
          discount_amount?: number
          discount_code?: string | null
          metadata?: Json
          paid_at?: string | null
          refunded_at?: string | null
          refund_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      webinars: {
        Row: {
          id: string
          site_id: string
          title: string
          description: string | null
          webinar_type: 'live' | 'automated' | 'hybrid'
          status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'
          scheduled_at: string | null
          duration_minutes: number
          timezone: string
          registration_page_id: string | null
          thank_you_page_id: string | null
          stream_url: string | null
          replay_url: string | null
          replay_available: boolean
          replay_expires_at: string | null
          max_attendees: number | null
          registration_count: number
          attendance_count: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          title: string
          description?: string | null
          webinar_type: 'live' | 'automated' | 'hybrid'
          status?: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          duration_minutes?: number
          timezone?: string
          registration_page_id?: string | null
          thank_you_page_id?: string | null
          stream_url?: string | null
          replay_url?: string | null
          replay_available?: boolean
          replay_expires_at?: string | null
          max_attendees?: number | null
          registration_count?: number
          attendance_count?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          title?: string
          description?: string | null
          webinar_type?: 'live' | 'automated' | 'hybrid'
          status?: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          duration_minutes?: number
          timezone?: string
          registration_page_id?: string | null
          thank_you_page_id?: string | null
          stream_url?: string | null
          replay_url?: string | null
          replay_available?: boolean
          replay_expires_at?: string | null
          max_attendees?: number | null
          registration_count?: number
          attendance_count?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
