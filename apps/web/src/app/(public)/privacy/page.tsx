export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>
          SOL Hub respects your privacy. This policy explains how we collect, use,
          and protect your personal information.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">1. Information We Collect</h2>
        <p>
          We collect information you provide: name, email, profile details, and
          any content you submit. We also collect usage data and cookies to
          improve your experience.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">2. How We Use Your Data</h2>
        <p>
          We use your data to operate the platform, process payments, send
          notifications, and improve our services. We never sell your personal
          information to third parties.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">3. Data Sharing</h2>
        <p>
          We share data with trusted service providers (Stripe for payments,
          Resend for email) who process data under our instructions. We may
          disclose data if required by law.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">4. Security</h2>
        <p>
          We implement industry-standard security measures including encryption
          in transit and at rest. However, no system is 100% secure. You are
          responsible for safeguarding your password.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">5. Your Rights</h2>
        <p>
          You may access, update, or delete your data at any time through account
          settings. You may export your data by contacting us. You may opt out of
          marketing emails.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">6. Cookies</h2>
        <p>
          We use essential cookies for authentication and security. Analytics
          cookies help us understand usage. You can control cookie preferences
          in your browser settings.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">7. Contact</h2>
        <p>
          For privacy-related inquiries, contact us at privacy@solhub.com. We
          will respond within 30 days.
        </p>

        <p className="mt-8 text-sm">
          Last updated: June 2026.
        </p>
      </div>
    </div>
  );
}
