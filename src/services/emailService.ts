interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private static async send(options: EmailOptions) {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          from: options.from || 'notifications@creatorapp.us',
          replyTo: options.replyTo || 'support@creatorapp.us',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  }

  static async sendWelcomeEmail(userEmail: string, userName: string) {
    return this.send({
      to: userEmail,
      subject: 'Welcome to CreatorApp! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome ${userName}!</h1>
          <p>Thanks for joining CreatorApp. We're excited to help you build amazing websites.</p>

          <h2>Getting Started</h2>
          <ol>
            <li>Create your first site</li>
            <li>Choose from our beautiful templates</li>
            <li>Customize with our drag-and-drop editor</li>
            <li>Publish and share with the world</li>
          </ol>

          <a href="https://creatorapp.us/dashboard"
             style="display: inline-block; background: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;
                    margin: 20px 0;">
            Go to Dashboard
          </a>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            Need help? Reply to this email or visit our support center.
          </p>
        </div>
      `,
      text: `Welcome ${userName}! Thanks for joining CreatorApp. Visit https://creatorapp.us/dashboard to get started.`,
    });
  }

  static async sendOrderConfirmation(
    customerEmail: string,
    orderId: string,
    orderTotal: number,
    items: Array<{ name: string; quantity: number; price: number }>
  ) {
    const itemsList = items
      .map(
        (item) =>
          `<li>${item.name} × ${item.quantity} - $${(item.price / 100).toFixed(2)}</li>`
      )
      .join('');

    return this.send({
      to: customerEmail,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been received and is being processed.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order #${orderId}</h2>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
            <p style="font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #d1d5db;">
              Total: $${(orderTotal / 100).toFixed(2)}
            </p>
          </div>

          <p>You'll receive another email when your order is ready for delivery.</p>

          <a href="https://creatorapp.us/orders/${orderId}"
             style="display: inline-block; background: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Order Details
          </a>
        </div>
      `,
      text: `Order Confirmed! Order #${orderId} - Total: $${(orderTotal / 100).toFixed(2)}`,
    });
  }

  static async sendPasswordReset(userEmail: string, resetLink: string) {
    return this.send({
      to: userEmail,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <a href="${resetLink}"
             style="display: inline-block; background: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;
                    margin: 20px 0;">
            Reset Password
          </a>

          <p style="color: #dc2626; font-weight: bold;">This link expires in 1 hour.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Reset your password: ${resetLink} (expires in 1 hour)`,
    });
  }

  static async sendSubscriptionExpiring(
    userEmail: string,
    userName: string,
    daysRemaining: number
  ) {
    return this.send({
      to: userEmail,
      subject: `Your Subscription Expires in ${daysRemaining} Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Don't Lose Access!</h1>
          <p>Hi ${userName},</p>
          <p>Your CreatorApp subscription expires in <strong>${daysRemaining} days</strong>.</p>

          <p>Renew now to keep access to:</p>
          <ul>
            <li>All your sites and pages</li>
            <li>Premium templates</li>
            <li>E-commerce features</li>
            <li>Email marketing tools</li>
          </ul>

          <a href="https://creatorapp.us/settings?tab=subscription"
             style="display: inline-block; background: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;
                    margin: 20px 0;">
            Renew Subscription
          </a>
        </div>
      `,
      text: `Your subscription expires in ${daysRemaining} days. Renew at https://creatorapp.us/settings?tab=subscription`,
    });
  }

  static async sendCustomEmail(to: string | string[], subject: string, html: string) {
    return this.send({ to, subject, html });
  }
}
