import { Card, CardContent } from "@/src/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="text-center">
        <h1 className="text-5xl font-black font-heading">About SOL Hub</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          We are on a mission to democratize access to the resources needed to build successful,
          impact-driven businesses.
        </p>
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold font-heading">Mission</h3>
            <p className="mt-3 text-muted-foreground">
              To empower underserved founders with the mentorship, funding, and community they need
              to turn their visions into thriving enterprises.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold font-heading">Vision</h3>
            <p className="mt-3 text-muted-foreground">
              A world where every great idea has the support it needs to become a force for positive
              change.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold font-heading">Values</h3>
            <p className="mt-3 text-muted-foreground">
              Community, Impact, Transparency, Innovation, and Conscious Growth guide everything we
              do.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-4xl font-bold font-heading">Our Team</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary font-heading">
                L
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Laurel</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & CEO</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Visionary leader with a passion for building communities that empower entrepreneurs.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary font-heading">
                T
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Tom</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & CTO</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Technical architect behind the platform, committed to building tools that connect and
                empower.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
