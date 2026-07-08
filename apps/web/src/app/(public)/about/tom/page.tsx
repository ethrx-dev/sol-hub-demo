"use client";

import Link from "next/link";

export default function TomPage() {
  return (
    <>
      <section className="relative py-24 text-center bg-footer">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
            About Us
          </h2>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">
            Tom Buckner
          </h2>
          <p className="mt-4 text-xl text-accent font-bold font-heading">CO-FOUNDER</p>
        </div>
      </section>



      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-start">
            <div>
              <div className="overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src="/tom-profile.jpg" alt="Tom Buckner" className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground leading-relaxed">
                After a few serendipitous meetings over seven years and a long road trip, I came to understand that Laurel's passion for the Russian School and helping young people discover themselves was an answer to a calling I've carried my whole life.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                My background is in technology and systems thinking — building platforms that connect people, ideas, and resources. I believe that when the right infrastructure is in place, transformative ideas can scale and create lasting impact.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Together with Laurel, we are building Spaces of Learning as a platform for spiritual entrepreneurship — a place where innovators, mentors, and conscious investors can come together to regenerate our communities and our planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-center" style={{ background: "#000000" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-2xl font-bold font-heading text-white">
            We can build a better future!
          </p>
          <Link
            href="/about"
            className="btn-sol uppercase text-sm text-white mt-8 inline-block"
            style={{
              background: "#729D64",
              borderRadius: "0 30px 0 30px",
              padding: "20px 40px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
          >
            Back to About
          </Link>
        </div>
      </section>
    </>
  );
}
