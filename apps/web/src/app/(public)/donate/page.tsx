"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

const CAROUSEL_IMAGES = [
  { src: "/donate/img-9695.jpg", alt: "Vector Aero aircraft" },
  { src: "/donate/img-9697.jpg", alt: "Vector Aero team" },
  { src: "/donate/aviate7.webp", alt: "Aviation training" },
];

const FAQ_ITEMS = [
  { title: "Satisfaction in growing a better tomorrow", body: "Contact us and schedule a call with Laurel." },
  { title: "Private Social Network Access", body: "Our Private Members Association protects all parties and their ideas." },
  { title: "Updates and Insights of on-going projects", body: "Sign-up for upcoming events and receive email alerts." },
  { title: "How can I help?", body: "Donating to Spaces of Learning with land, time or funds for training." },
];

export default function DonatePage() {
  const router = useRouter();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const prev = () => setCarouselIdx((i) => (i === 0 ? CAROUSEL_IMAGES.length - 1 : i - 1));
  const next = () => setCarouselIdx((i) => (i === CAROUSEL_IMAGES.length - 1 ? 0 : i + 1));

  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section
        className="relative flex min-h-[78vh] items-center"
        style={{
          backgroundImage: "url('/donate/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 150px 0 150px",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)", opacity: 0.5, borderRadius: "0 150px 0 150px" }} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-[70%]">
            <h1 className="text-7xl font-black font-heading text-white" style={{ fontSize: "5.2rem", lineHeight: "1.1" }}>
              How to help!
            </h1>
            <h2 className="mt-4 text-white" style={{ fontSize: "4rem", fontWeight: 900, lineHeight: "1" }}>
              Want to donate to a loving cause?
            </h2>
            <p className="mt-4 text-white/90" style={{ fontSize: "1.4rem" }}>
              Become an AdVenture Capitalist in an amazing community, that brings a better tomorrow.
            </p>
            <div className="mt-8">
              <Button
                corner="sol"
                size="lg"
                className="bg-[#729D64] hover:bg-[#EFC89A] hover:text-black text-white font-semibold rounded-none rounded-r-[30px]"
                style={{ padding: "20px 40px", borderRadius: "0 30px 0 30px" }}
                onClick={() => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })}
              >
                Donate Now
              </Button>
            </div>
          </div>
        </div>

      </section>

      {/* ===== WHY DONATE ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="w-[62%]">
          <div
            className="inline-block bg-[#EFC89A] px-[15px] py-[5px]"
            style={{ borderRadius: "0 10px 0 10px" }}
          >
            <h2 className="text-[12px] font-medium uppercase tracking-[3px] text-black">Why Donate?</h2>
          </div>
          <p className="mt-4 text-black font-bold" style={{ fontSize: "2.2rem", lineHeight: "1.1" }}>
            Help the innovators achieve great goals!
          </p>
        </div>
      </section>

      {/* ===== FRESH IDEAS + IMAGE ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse md:flex-row">
          <div className="w-full md:w-[35%] relative z-[2]">
            <div
              className="bg-[#5C6E56] p-[60px]"
              style={{ borderRadius: "60px 0 60px 0", margin: "60px -140px 60px 0" }}
            >
              <h4 className="text-white text-lg font-bold" style={{ fontSize: "1.8rem", lineHeight: "1.1" }}>
                FRESH IDEAS NEED SUPPORT
              </h4>
            </div>
            <p className="mt-6 text-gray-600 leading-relaxed" style={{ fontSize: "1rem" }}>
              By donating to SOL, you empower visionary ideas&mdash;many sparked by young people&mdash;that create real-world solutions for sustainability, community wellbeing, and a regenerative future. Your support helps turn purpose-driven concepts into impactful projects, giving the next generation the resources they need to build a better world for all.
            </p>
            <h2 className="mt-8 font-bold text-black" style={{ fontSize: "2.6rem", lineHeight: "1.1" }}>
              A new way to invest your capital
            </h2>
          </div>
          <div className="w-full md:w-[65%] flex justify-center">
            <img
              src="/donate/img-0067.jpg"
              alt="Spaces of Learning"
              className="h-[700px] w-full object-cover"
              style={{ borderRadius: "0 100px 0 100px" }}
            />
          </div>
        </div>
      </section>

      {/* ===== A GREAT MISSION / REASONS ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-[99%]">
          <div
            className="inline-block bg-[#EFC89A] px-[15px] py-[5px]"
            style={{ borderRadius: "0 10px 0 10px" }}
          >
            <h2 className="text-[12px] font-medium uppercase tracking-[3px] text-black">A GREAT MISSION</h2>
          </div>
          <h3 className="mt-2 font-black text-black" style={{ fontSize: "4rem", lineHeight: "1", fontWeight: 900 }}>
            Reasons to Support SOL&apos;s Mission
          </h3>
          <p className="mt-2 font-bold text-[#EFC89A]" style={{ fontSize: "1.4rem", lineHeight: "1.1" }}>
            We &quot;shine LIGHT (sol) onto SOuLs of YOUTHful ideas&quot;
          </p>
        </div>
      </section>

      {/* ===== 4 REASONS CARDS ===== */}
      <section className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/donate/sol-icon.svg')",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% auto",
            opacity: 0.06,
          }}
        />
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px]">
            {[
              { title: "Impactful Innovation", desc: "Support projects that drive real change in sustainability, community wellbeing, and regenerative culture.", bg: "#729D64", radius: "70px 0 70px 0" },
              { title: "Empowering the Next Generation", desc: "Invest in young, visionary talent and help them turn fresh ideas into thriving ventures.", bg: "#5C6E56", radius: "0 70px 0 70px" },
              { title: "Community-Driven Growth", desc: "Be part of a collaborative network that connects innovators, mentors, and conscious investors for greater collective impact.", bg: "#5C6E56", radius: "0 70px 0 70px" },
              { title: "Purpose and Profit", desc: "Align your investment with meaningful outcomes, knowing your support helps build enterprises that benefit both society and the planet.", bg: "#729D64", radius: "70px 0 70px 0" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-[70px] pr-[100px]"
                style={{ backgroundColor: item.bg, borderRadius: item.radius }}
              >
                <h3 className="font-bold text-[#EFC89A]" style={{ fontSize: "1.8rem", lineHeight: "1.1" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-white text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DONATE TODAY ===== */}
      <section id="donate" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="w-[99%]">
          <div
            className="inline-block bg-[#EFC89A] px-[15px] py-[5px]"
            style={{ borderRadius: "0 10px 0 10px" }}
          >
            <h2 className="text-[12px] font-medium uppercase tracking-[3px] text-black">DONATE TODAY!</h2>
          </div>
          <p className="mt-3 font-bold text-black" style={{ fontSize: "1.4rem", lineHeight: "1.1" }}>
            Jump in and help how you can!
          </p>
          <p className="mt-1 font-bold text-black" style={{ fontSize: "1.4rem", lineHeight: "1.1" }}>
            You choose which project or person you&apos;d like to help succeed
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: (
                <svg viewBox="0 0 576 512" className="h-[91px] w-[91px] fill-[#EFC89A]"><path d="M275.3 250.5c7 7.4 18.4 7.4 25.5 0l108.9-114.2c31.6-33.2 29.8-88.2-5.6-118.8-30.8-26.7-76.7-21.9-104.9 7.7L288 36.9l-11.1-11.6C248.7-4.4 202.8-9.2 172 17.5c-35.3 30.6-37.2 85.6-5.6 118.8l108.9 114.2zm290 77.6c-11.8-10.7-30.2-10-42.6 0L430.3 402c-11.3 9.1-25.4 14-40 14H272c-8.8 0-16-7.2-16-16s7.2-16 16-16h78.3c15.9 0 30.7-10.9 33.3-26.6 3.3-20-12.1-37.4-31.6-37.4H192c-27 0-53.1 9.3-74.1 26.3L71.4 384H16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16h356.8c14.5 0 28.6-4.9 40-14L564 377c15.2-12.1 16.4-35.3 1.3-48.9z"/></svg>
              ),
              title: "You Choose",
              desc: "Donate any amount you like that works for your budget.",
              url: "https://buy.stripe.com/eVq6oI9d8bLf4EZe1t2Nq02",
              btn: "Choose Amount",
              popular: false,
            },
            {
              icon: (
                <svg viewBox="0 0 448 512" className="h-[91px] w-[91px] fill-[#EFC89A]"><path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z"/></svg>
              ),
              title: "$50/monthly",
              desc: "Support us monthly for $50 a month for a good cause.",
              url: "https://donate.stripe.com/fZufZidto8z3c7r9Ld2Nq01",
              btn: "Sign-Up",
              popular: true,
            },
            {
              icon: (
                <svg viewBox="0 0 512 512" className="h-[91px] w-[91px] fill-[#EFC89A]"><path d="M502.63 39L473 9.37a32 32 0 0 0-45.26 0L381.46 55.7a35.14 35.14 0 0 0-8.53 13.79L360.77 106l-76.26 76.26c-12.16-8.76-25.5-15.74-40.1-19.14-33.45-7.78-67-.88-89.88 22a82.45 82.45 0 0 0-20.24 33.47c-6 18.56-23.21 32.69-42.15 34.46-23.7 2.27-45.73 11.45-62.61 28.44C-16.11 327-7.9 409 47.58 464.45S185 528 230.56 482.52c17-16.88 26.16-38.9 28.45-62.71 1.76-18.85 15.89-36.13 34.43-42.14a82.6 82.6 0 0 0 33.48-20.25c22.87-22.88 29.74-56.36 22-89.75-3.39-14.64-10.37-28-19.16-40.2L406 151.23l36.48-12.16a35.14 35.14 0 0 0 13.79-8.53l46.33-46.32a32 32 0 0 0 .03-45.22zM208 352a48 48 0 1 1 48-48 48 48 0 0 1-48 48z"/></svg>
              ),
              title: "$100/month",
              desc: "Be a Rockstar for $100 a month for a good cause.",
              url: "https://donate.stripe.com/fZu5kEblgaHbfjD9Ld2Nq00",
              btn: "Sign-Up",
              popular: false,
            },
          ].map((tier) => (
            <div
              key={tier.title}
              className="flex flex-col items-center p-10 bg-white"
              style={{ borderRadius: "20px 0 20px 0", boxShadow: "0px 0px 10px 10px rgba(0,0,0,0.12)" }}
            >
              {tier.icon}
              <h3 className="mt-4 font-bold text-black text-center" style={{ fontSize: "1.4rem", lineHeight: "1.1" }}>
                {tier.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 text-center">{tier.desc}</p>
              <div className="mt-6 w-full">
                <Button
                  className="w-full bg-[#729D64] hover:bg-[#EFC89A] hover:text-black text-white font-semibold"
                  style={{ padding: "20px 40px", borderRadius: "0 30px 0 30px" }}
                  onClick={() => window.open(tier.url, "_blank")}
                >
                  {tier.btn}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VECTOR AERO ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div
          className="p-10 bg-white"
          style={{ borderRadius: "20px 0 20px 0", boxShadow: "0px 0px 10px 10px rgba(0,0,0,0.12)" }}
        >
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div
                className="inline-block bg-[#EFC89A] px-[15px] py-[5px]"
                style={{ borderRadius: "0 10px 0 10px" }}
              >
                <h2 className="text-[12px] font-medium uppercase tracking-[3px] text-black">Become an investor</h2>
              </div>
              <h2 className="mt-4 font-black text-black" style={{ fontSize: "2.6rem", lineHeight: "1.1" }}>
                VECTOR AERO
              </h2>
              <p className="mt-1 font-bold text-[#EFC89A]" style={{ fontSize: "1.4rem", lineHeight: "1.1" }}>
                &ldquo;direction and purpose&rdquo;
              </p>

              <div className="mt-6">
                <Button
                  className="bg-[#729D64] hover:bg-[#EFC89A] hover:text-black text-white font-semibold"
                  style={{ padding: "20px 40px", borderRadius: "0 30px 0 30px" }}
                  onClick={() => window.open("https://buy.stripe.com/cNi9AUdtodTn3AV7D52Nq03", "_blank")}
                >
                  Invest In Aero
                </Button>
              </div>

              <hr className="my-6 border-[#EFC89A]" />

              <img src="/donate/va-logo.png" alt="Vector Aero" className="mb-6 h-auto" style={{ maxWidth: "233px" }} />

              <p className="text-sm text-gray-600 leading-relaxed">
                Our mission is to create a sustainable cycle of acquiring, upgrading, and leasing training aircraft, supplying the growing demand for pilots in the coming decade. This positions us to integrate next-generation technology such as electric trainers as the market evolves. A commitment to accessibility remains central, with 10% of net profits dedicated to outreach and scholarships, supported by strategic partnerships. With patience, scalability, and disciplined growth, this vision will be carried out with respect, transparency, and tireless effort.
              </p>
            </div>

            <div className="flex items-center">
              <div className="relative w-full">
                <div className="overflow-hidden" style={{ borderRadius: "20px" }}>
                  <img
                    src={CAROUSEL_IMAGES[carouselIdx].src}
                    alt={CAROUSEL_IMAGES[carouselIdx].alt}
                    className="h-[500px] w-full object-cover transition-all duration-500"
                  />
                </div>
                <button
                  onClick={prev}
                  className="absolute left-[0px] top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-black shadow hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-[0px] top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-black shadow hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="mt-4 flex justify-center gap-2">
                  {CAROUSEL_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIdx(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${i === carouselIdx ? "bg-[#EFC89A]" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU GET / FAQ ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="w-full md:w-2/3">
          <h2 className="font-black text-black" style={{ fontSize: "2.6rem", lineHeight: "1.1" }}>
            What you get?
          </h2>
          <div className="mt-6 space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-10 py-[15px] text-left font-bold text-black"
                  style={{ backgroundColor: "#CFDCCC", fontSize: "18px" }}
                >
                  {item.title}
                  <ChevronRight className={`h-4 w-4 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-10 py-[30px] text-sm text-gray-600">{item.body}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section
        className="relative flex min-h-[84vh] items-center"
        style={{
          backgroundImage: "url('/donate/cta-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 150px 0 150px",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)", opacity: 0.5, borderRadius: "0 150px 0 150px" }} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-[70%]">
            <h2 className="text-white" style={{ fontSize: "1.4rem", lineHeight: "1.1", fontWeight: 700 }}>
              Building a brighter future
            </h2>
            <p className="mt-4 text-white" style={{ fontSize: "4rem", fontWeight: 900, lineHeight: "1" }}>
              Let&apos;s make a new world together
            </p>
            <p className="mt-4 text-white/90" style={{ fontSize: "1.4rem" }}>
              Get involved at SOL and create great opportunities for everyone
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="bg-[#729D64] hover:bg-[#EFC89A] hover:text-black text-white font-semibold"
                style={{ padding: "20px 40px", borderRadius: "0 30px 0 30px" }}
                onClick={() => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })}
              >
                DONATE NOW
              </Button>
              <Button
                className="bg-transparent hover:bg-[#729D64] hover:text-white text-white font-semibold"
                style={{ padding: "20px 40px", borderRadius: "0 30px 0 30px", border: "2px solid #EFC89A" }}
                onClick={() => router.push("/become-a-member")}
              >
                Members Portal
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
