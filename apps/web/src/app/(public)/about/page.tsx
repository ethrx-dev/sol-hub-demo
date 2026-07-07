"use client";

import { useState, useEffect } from "react";
import { DynamicPage } from "@/src/components/admin/section-renderers";
import Link from "next/link";
import { Check } from "lucide-react";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const values = [
  "Collaboration over competition",
  "Regeneration over extraction",
  "Integrity over shortcuts",
  "Learning through doing",
  "People and planet alongside profit",
];

const services = [
  "Guided discovery to help individuals identify their skills, passions, and practical strengths",
  "Mentorship from experienced guides who support both personal and project development",
  "Community for collaboration, accountability, and shared learning",
  "Conscious capital connections for projects aligned with regenerative and social good values",
];

const serves = [
  "People who want to create their own livelihood",
  "Innovators with ideas for positive change",
  "Those who feel something is missing in current systems and want to help build better ones",
  "Mentors and investors who believe in supporting purpose-driven work",
];

const loveQuestions = [
  "What are they?",
  "Where did this notion come from?",
  "Why are they important for the next generations and time here on Earth",
];

export default function AboutPage() {
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/about`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setCmsPage(data))
      .catch(() => setCmsPage(null));
  }, []);

  if (cmsPage && cmsPage !== "loading" && cmsPage.sections && cmsPage.sections.length > 0) {
    return <DynamicPage sections={cmsPage.sections} />;
  }

  return (
    <>
      {/* ===== 1. HERO ===== */}
      <section className="px-5 sm:px-10 pt-5">
        <div
          className="relative overflow-hidden flex items-center min-h-[60vh]"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/about-hero-bg.jpg)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
              opacity: 0.5,
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Spaces Of Learning</h2>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">About Us</h2>
              <h2 className="mt-4 text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">We Love Learning</h2>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 2. ABOUT SPACES OF LEARNING ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            ABOUT SPACES OF LEARNING
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">About Spaces of Learning</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Spaces of Learning exists to bridge vision and action. We support people who feel called
            to create something meaningful&mdash;whether they already have a clear idea or are just
            beginning to sense their own potential.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Not everyone arrives with a business plan. Many arrive with a skill, a life experience,
            or a feeling that they want to build something of their own. At Spaces of Learning, we
            help uncover those abilities, clarify them, and shape them into viable projects and
            businesses that can support a person&apos;s life while contributing something of value
            to the world.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We work with innovators, mentors, and conscious investors to cultivate enterprises
            rooted in purpose, sustainability, and real-world impact. Our approach blends practical
            business development with human-centered guidance&mdash;helping people grow ideas that
            align with their values and their communities.
          </p>
        </div>
      </section>

      {/* ===== 3. WHAT WE DO ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            WHAT WE DO
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">What we do</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">Spaces of Learning provides:</p>
          <ul className="mt-4 space-y-2">
            {services.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We help translate raw potential into clear direction and tangible plans.
          </p>
        </div>
      </section>

      {/* ===== 4. WHO WE SERVE ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            WHO WE SERVE
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Who we serve</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">We work with:</p>
          <ul className="mt-4 space-y-2">
            {serves.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            You do not need to arrive with everything figured out. You only need curiosity,
            commitment, and a willingness to explore what you can create.
          </p>
        </div>
      </section>

      {/* ===== 5. OUR VALUES ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            OUR VALUES
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Our Values</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">We are guided by:</p>
          <ul className="mt-4 space-y-2">
            {values.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== 6. OUR VISION / MISSION / INVITATION ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            OUR VISION
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Our Vision</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            We envision a world where people are able to support themselves through work that is
            aligned with who they are&mdash;where communities are strengthened by locally rooted
            enterprises and where innovation serves life, not just markets.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            OUR MISSION
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Our Mission</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Our mission is to support innovators who see a problem and want to solve it&mdash;or who
            have a solution and need help bringing it to life&mdash;by connecting them with
            mentorship, community, and conscious capital through our hub of resources.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            AN INVITATION
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">An Invitation</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            If you feel called to create, to learn, or to contribute to something larger than
            yourself, Spaces of Learning is a place to begin. Whether you arrive with an idea or are
            searching for one, we are here to help you discover your path and build something real
            from it.
          </p>
        </div>
      </section>

      {/* ===== 7. FOUNDER IMAGES ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden relative" style={{ borderRadius: "100px 0 100px 0" }}>
              <img src="/about-team.jpg" alt="Laurel & Tom" className="h-full w-full object-cover" />
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none opacity-60">
                <img src="/sol-shape-gardenie.png" alt="" className="w-[80px] sm:w-[120px]" />
              </div>
            </div>
            <div className="overflow-hidden relative">
              <div className="-mt-[100px] relative" style={{ borderRadius: "100px 0 100px 0" }}>
                <img src="/about-founder-2.jpg" alt="Laurel & Tom" className="w-full h-[260px] object-cover" />
                <div className="absolute bottom-2 right-2 z-10 pointer-events-none opacity-60">
                  <img src="/sol-shape-gardenie.png" alt="" className="w-[80px] sm:w-[120px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. WHO WE ARE ===== */}
      <section className="relative py-16" style={{ background: "#5C6E56" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-start">
            <div>
              <span
                className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
                style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
              >
                ABOUT US
              </span>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent mt-4">Who we are</h2>
              <h2 className="mt-2 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">Meet Laurel &amp; Tom</h2>
              <p className="mt-6 text-white/90 leading-relaxed">
                We have a dream&hellip;to provide a SPACE where people, with their fresh new ideas, have
                access to experts, mentors, equipment, courses, funding, to collaborate in problem
                solving for solutions for a better world &ndash; sparking their own product or service as a
                business, becoming a spiritual entrepreneur.
              </p>
              <p className="mt-4 text-white/90 leading-relaxed">
                Together, we aim to leave a lasting, positive impact on the planet for future
                generations.
              </p>
              <p className="mt-4 text-white/90 leading-relaxed">
                We are excited to bring the community together with our team of experts, while learning
                valuable trades and personal skills that empower new solutions for global health &ndash;
                locally.
              </p>
              <p className="mt-4 text-white/90 leading-relaxed">
                I recognize a gap in our development as a species in our post industrialized world&mdash;a
                missing &apos;rite of passage&apos; to help YOUTH discover their passions and find purpose
                in this very changed world. In collaboration with industry and &apos;thought&apos; experts
                and funders, I aim to foster introspection, self-reliance, compassion, and an
                entrepreneurial spirit.
              </p>
            </div>
            <div>
              <div className="rounded-[60px_0_60px_0] p-[60px]" style={{ background: "#5C6E56" }}>
                <div>
                  <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Laurel</h2>
                  <p className="mt-2 text-lg text-white font-heading">Ceo/Founder</p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link
                      href="/about/laurel-white"
                      className="btn-sol uppercase text-sm text-white inline-block"
                      style={{
                        background: "#729D64",
                        borderRadius: "0 30px 0 30px",
                        padding: "16px 32px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
                    >
                      Meet Laurel
                    </Link>
                    <Link
                      href="/about/tom"
                      className="btn-sol uppercase text-sm text-white inline-block"
                      style={{
                        background: "#729D64",
                        borderRadius: "0 30px 0 30px",
                        padding: "16px 32px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
                    >
                      Meet Tom
                    </Link>
                  </div>
                  <div className="mt-8 border-dashed border-l border-[#5C6E56] pl-8">
                    <p className="text-accent italic leading-relaxed text-lg">
                      I call this becoming a SPIRITUAL ENTREPRENEUR.
                    </p>
                    <p className="mt-4 text-white leading-relaxed">
                      Becoming the Architect of your life for True Freedom!
                    </p>
                  </div>
                </div>
              </div>
            <div className="mt-6 relative" style={{ borderRadius: "0 100px 0 100px", overflow: "hidden" }}>
              <img src="/about-founder-1.jpg" alt="Laurel & Tom" className="w-full object-cover" />
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none opacity-60">
                <img src="/sol-shape-gardenie.png" alt="" className="w-[80px] sm:w-[120px]" />
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 9. HOW IT ALL BEGAN ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-start">
            <div>
              <span
                className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
                style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
              >
                HOW IT ALL BEGAN
              </span>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">How it all began</h2>
              <h4 className="mt-2 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Spaces of Love</h4>
              <div className="mt-6 space-y-2">
                {loveQuestions.map((q) => (
                  <p key={q} className="text-muted-foreground italic">
                    <span className="text-accent font-bold">&mdash;</span> {q}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-muted-foreground italic">
                These are the questions we answer here.
              </p>
              <div className="mt-6 border-l-2 border-dashed border-secondary pl-6">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Vision for a New Society</span>
                </p>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Throughout the book, The Space of Love, Megre and Anastasia explore the idea that a
                  &ldquo;space of love&rdquo; &mdash; rooted in family, land, and conscious living &mdash;
                  can transform individuals and communities. The emphasis is on reconnecting with nature,
                  ancestors, and one&apos;s true purpose.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  It invites readers to rethink how we raise children, educate communities, live with the
                  land, and relate to one another &mdash; suggesting that a life built on love, intention,
                  and harmony with nature is both possible and essential.
                </p>
              </div>
            </div>
            <div className="pt-10">
            <div className="overflow-hidden relative" style={{ borderRadius: "0 100px 0 100px" }}>
              <img
                src="/about-bg.jpg"
                alt="The Space of Love"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none opacity-60">
                <img src="/sol-shape-gardenie.png" alt="" className="w-[80px] sm:w-[120px]" />
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 10. IT ALL BEGINS SOMEWHERE ===== */}
      <section
        className="relative py-[10%] overflow-hidden text-center"
        style={{ background: "#729D64" }}
      >
        <div
          className="absolute inset-0 opacity-[0.17] pointer-events-none"
          style={{
            backgroundImage: "url(/sol-icon-color.svg)",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            INSPIRATION
          </span>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-white mt-4">
            It all begins somewhere!
          </h2>
          <p className="mt-6 text-white/90 leading-relaxed max-w-2xl mx-auto">
            Laurel was invited to visit this school as she reached out to them once she learned of
            its existence. The timing wasn&apos;t good, so she researched it continuously, from
            afar. Laurel&apos;s vision of a school like this has been in her heart since she was
            given these books by the editor, Dr. Leonid Sharaskin, in 2005 on Maui, where she lived
            off the grid, offering cleansing yoga retreats.
          </p>
        </div>
      </section>

      {/* ===== 11. FINAL CTA ===== */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-accent">
            Join Us on This Journey
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Be a part of the movement to create the New Earth. Whether you&apos;re an entrepreneur,
            investor, mentor, or dreamer, SOL is your platform to make a difference.
          </p>
          <Link
            href="/become-a-member"
            className="btn-sol uppercase text-sm text-white mt-8 inline-block"
            style={{
              background: "#729D64",
              borderRadius: "0 30px 0 30px",
              padding: "20px 40px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
          >
            How We Do It!
          </Link>
        </div>
      </section>
    </>
  );
}
