import { Card, CardContent } from "@/src/components/ui/card";

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute -top-20 -right-20 opacity-[0.04] pointer-events-none">
        <img src="/sol-icon-color.svg" alt="" className="w-[300px]" />
      </div>
      <div className="absolute -bottom-20 -left-20 opacity-[0.04] pointer-events-none rotate-45">
        <img src="/sol-asset-3.svg" alt="" className="w-[300px]" />
      </div>

      <section className="text-center relative">
        <div className="flex justify-center mb-4">
          <img src="/sol-icon-color.svg" alt="SOL" className="h-14 w-14" />
        </div>
        <h1 className="text-5xl font-black font-heading">About SOL Hub</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          We are on a mission to democratize access to the resources needed to build successful,
          impact-driven businesses.
        </p>
      </section>

      <section className="mt-12">
        <div className="aspect-[21/9] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
          <img
            src="/sol-team-tomlaurel.jpg"
            alt="SOL Hub founders"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <img src="/sol-icon-color.svg" alt="" className="h-10 w-10 opacity-60" />
            </div>
            <h3 className="text-xl font-bold font-heading">Mission</h3>
            <p className="mt-3 text-muted-foreground">
              To empower underserved founders with the mentorship, funding, and community they need
              to turn their visions into thriving enterprises.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <img src="/sol-icon-color.svg" alt="" className="h-10 w-10 opacity-60" />
            </div>
            <h3 className="text-xl font-bold font-heading">Vision</h3>
            <p className="mt-3 text-muted-foreground">
              A world where every great idea has the support it needs to become a force for positive
              change.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <img src="/sol-icon-color.svg" alt="" className="h-10 w-10 opacity-60" />
            </div>
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
              <div className="mx-auto h-32 w-32 rounded-full overflow-hidden">
                <img
                  src="/sol-profile-laurel.jpg"
                  alt="Laurel"
                  className="h-full w-full object-cover"
                />
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
              <div className="mx-auto h-32 w-32 rounded-full overflow-hidden">
                <img
                  src="/sol-profile-tom.jpg"
                  alt="Tom"
                  className="h-full w-full object-cover"
                />
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

      <section className="mt-20">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="aspect-[4/3] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
            <img
              src="/sol-about-team.jpg"
              alt="SOL Hub team"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-heading">Our Story</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              SOL Hub was born from a simple belief: that every great idea deserves a chance to grow.
              Founded by Laurel and Tom, our platform connects visionary innovators with the mentors
              and conscious investors who can help bring their dreams to life.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We are building more than a platform — we are building a movement. A community where
              collaboration replaces competition, where conscious capital fuels positive change, and
              where the next generation of entrepreneurs can find the support they need to thrive.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
