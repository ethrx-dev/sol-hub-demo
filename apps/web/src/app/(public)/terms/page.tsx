export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>
          Welcome to SOL Hub. By accessing or using our platform, you agree to be
          bound by these Terms of Service. If you do not agree, please do not use
          our services.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">1. Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activities under your account. You must provide
          accurate information and keep it updated.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">2. Platform Use</h2>
        <p>
          SOL Hub connects innovators, mentors, and investors. You agree to use the
          platform lawfully and respectfully. Harassment, fraud, or abuse will
          result in account termination.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">3. Intellectual Property</h2>
        <p>
          You retain ownership of content you submit. By posting, you grant SOL Hub
          a license to display and share it within the platform. You represent that
          you have the rights to any content you share.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">4. Payments & Subscriptions</h2>
        <p>
          Paid plans are billed on a recurring basis. You may cancel at any time.
          Refunds are handled on a case-by-case basis. All payments are processed
          securely through Stripe.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">5. Limitation of Liability</h2>
        <p>
          SOL Hub is provided &quot;as is&quot; without warranties. We are not liable for
          damages arising from your use of the platform, including lost
          opportunities or data.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">6. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these terms. You may
          delete your account at any time through settings.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-8">7. Changes</h2>
        <p>
          We may update these terms. Continued use after changes constitutes
          acceptance. We will notify you of material changes via email or
          platform notice.
        </p>

        <p className="mt-8 text-sm">
          Last updated: June 2026. Contact us at support@solhub.com with questions.
        </p>
      </div>
    </div>
  );
}
