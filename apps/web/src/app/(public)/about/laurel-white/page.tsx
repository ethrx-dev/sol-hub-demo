"use client";

import Link from "next/link";

export default function LaurelWhitePage() {
  return (
    <>
      <section className="relative py-24 text-center bg-footer">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
            About Us
          </h2>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">
            Laurel White
          </h2>
          <p className="mt-4 text-xl text-accent font-bold font-heading">CEO/FOUNDER</p>
        </div>
      </section>



      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-start">
            <div>
              <div className="overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src="/laurel-profile.jpg" alt="Laurel White" className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground leading-relaxed">
                Laurel White is the founder and CEO of Spaces Of Learning, an education and innovation company reimagining learning as a pathway to real-world problem solving and human potential. Her entrepreneurial journey spans over 30 years across the United States, Australia, and Hawai'i, where she has built ventures in wellness, education, and transformational learning.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Her early years were defined by exploration, athletic achievement, and entrepreneurship. As one of the first women in the United States to compete in windsurfing—and later the founder of one of the nation's first women's windsurfing schools—Laurel learned early that following her passion could create opportunities for herself and others.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Inspired by advanced international learning models, Laurel created Spaces Of Learning to address the gap between traditional education and practical contribution. Spaces Of Learning reimagines education as a bridge between passion and profession—empowering people of all ages to build purpose-driven lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#f9fafb" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <p className="text-muted-foreground leading-relaxed">
                At its core, Spaces Of Learning reflects Laurel's life purpose: to live sovereign and self-sufficient while in harmony and co-creation with others. She finds fulfillment in bringing others forward on their own paths of discovery.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Laurel envisions establishing communities that embody sustainability, beauty, and spiritual integrity, while assisting youth in finding their way by helping them build a business of their own for true freedom and healing.
              </p>
              <p className="mt-6 text-[1.4rem] font-bold font-heading text-accent">
                "We can build a better future!"
              </p>
            </div>
            <div>
              <div className="overflow-hidden shadow-lg" style={{ borderRadius: "40px 0 40px 0" }}>
                <img src="/laurel-candid.jpg" alt="Laurel White" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-center" style={{ background: "#000000" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[1.4rem] font-bold font-heading text-accent">
            I call this becoming a SPIRITUAL ENTREPRENEUR.
          </p>
          <p className="mt-4 text-2xl font-bold font-heading text-white">
            Becoming the Architect of your life for True Freedom!
          </p>
          <p className="mt-4 text-lg text-white/80">We can build a better future!</p>
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
