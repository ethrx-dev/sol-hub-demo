import { ShapoWidget } from "@/src/components/shared/ShapoWidget";

export const metadata = {
  title: "Testimonials | SOL Hub",
  description:
    "Hear what our community of innovators, mentors, and investors say about SOL Hub.",
};



export default function TestimonialsPage() {
  const widgetId = process.env.NEXT_PUBLIC_SHAPO_WIDGET_ID;
  const formUrl = process.env.NEXT_PUBLIC_SHAPO_FORM_ID
    ? `https://app.shapo.io/forms/${process.env.NEXT_PUBLIC_SHAPO_FORM_ID}`
    : null;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20 py-24">
        <div className="absolute -top-10 -right-10 opacity-[0.07] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[200px] sm:w-[300px]" />
        </div>
        <div className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-center">
            <img src="/sol-icon.svg" alt="" className="h-14 w-14" />
          </div>
          <h1 className="text-4xl font-bold font-heading sm:text-5xl">
            What Our Community Says
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real stories from innovators, mentors, and investors building the future together.
          </p>
        </div>
      </section>

      {widgetId ? (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ShapoWidget widgetId={widgetId} className="mx-auto" />
          </div>
        </section>
      ) : (
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-lg border bg-card p-12">
              <h2 className="text-2xl font-semibold">Testimonials Coming Soon</h2>
              <p className="mt-3 text-muted-foreground">
                We&apos;re collecting stories from our community. Check back soon to hear from innovators, mentors, and investors building the future on SOL Hub.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading">Share Your Story</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Are you part of the SOL Hub community? We&apos;d love to hear about your experience.
          </p>
          <div className="mt-10">
            <div className="rounded-lg border bg-card p-10">
              <p className="text-muted-foreground mb-6">
                Your testimonial helps others discover the impact of SOL Hub. Submit your story and it could be featured on this page.
              </p>
              {formUrl ? (
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sol btn-sol-primary inline-block"
                >
                  Write a Testimonial
                </a>
              ) : (
                <a
                  href="mailto:etherix.dev@proton.me"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  etherix.dev@proton.me
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-sage-light/30 py-20 overflow-hidden">
        <div className="absolute -left-10 top-0 opacity-[0.05] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[180px] sm:w-[250px]" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold font-heading">Ready to Join?</h2>
          <p className="mt-3 text-muted-foreground">
            Become part of a community that&apos;s building the future, one venture at a time.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/register"
              className="btn-sol btn-sol-primary uppercase text-sm"
            >
              Get Started Free
            </a>
            <a
              href="/about"
              className="btn-sol btn-sol-outline uppercase text-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
