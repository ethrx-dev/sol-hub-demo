import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, Handshake, GraduationCap, Check, Heart, FileText, Users, Pen, ArrowRight, Compass, Sparkles, HeartHandshake, Globe, Shield } from "lucide-react";

interface Section {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const ICON_MAP: Record<string, ReactNode> = {
  rocket: <Rocket className="h-12 w-12" />,
  handshake: <Handshake className="h-12 w-12" />,
  graduation_cap: <GraduationCap className="h-12 w-12" />,
  compass: <Compass className="h-12 w-12" />,
  file_text: <FileText className="h-8 w-8" />,
  users: <Users className="h-8 w-8" />,
  pen: <Pen className="h-8 w-8" />,
};

function HeroSlideshowBlock({ data }: { data: Record<string, unknown> }) {
  const slides = data.slides as string[] | undefined;
  const headingPrimary = data.heading_primary as string;
  const headingSecondary = data.heading_secondary as string;
  const description = data.description as string;
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!slides || slides.length < 2) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides?.length]);

  return (
    <section className="relative overflow-hidden px-5 sm:px-10 pb-[50px] pt-5">
      <div
        className="relative min-h-[84vh] overflow-hidden flex items-center"
        style={{ borderRadius: "0 150px 0 150px" }}
      >
        {(slides || []).map((src, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === activeSlide ? 1 : 0 }}
          >
            <div
              className="h-full w-full bg-cover bg-center scale-110 transition-transform duration-[8000ms]"
              style={{
                backgroundImage: `url(${src})`,
                transform: idx === activeSlide ? "scale(1)" : "scale(1.15)",
              }}
            />
          </div>
        ))}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
            opacity: 0.5,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl text-center">
            {headingPrimary && (
              <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
                {headingPrimary}
              </h2>
            )}
            {headingSecondary && (
              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">
                {headingSecondary}
              </h2>
            )}
            {description && (
              <p className="mt-6 text-lg sm:text-[1.4rem] text-white max-w-3xl mx-auto font-sans">
                {description}
              </p>
            )}
            {buttons && buttons.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                {buttons.map((btn, i) =>
                  btn.style === "outline" ? (
                    <Link
                      key={i}
                      href={btn.link}
                      className="btn-sol uppercase text-sm"
                      style={{
                        background: "transparent",
                        border: "2px solid #EFC89A",
                        color: "#fff",
                        padding: "18px 40px",
                        borderRadius: "0 30px 0 30px",
                      }}
                    >
                      {btn.label}
                    </Link>
                  ) : (
                    <Link
                      key={i}
                      href={btn.link}
                      className="btn-sol uppercase text-sm text-white"
                      style={{
                        background: "#729D64",
                        borderRadius: "0 30px 0 30px",
                        padding: "20px 40px",
                      }}
                    >
                      {btn.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TaglineBlock({ data }: { data: Record<string, unknown> }) {
  const headingPrimary = data.heading_primary as string;
  const headingSecondary = data.heading_secondary as string;
  const icon = data.icon as string;

  return (
    <section className="py-16 text-center" style={{ background: "#f9fafb" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {icon && (
          <div className="flex justify-center mb-6">
            <img src={icon} alt="" className="h-[74px] w-[74px]" />
          </div>
        )}
        {headingPrimary && (
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">
            {headingPrimary}
          </h2>
        )}
        {headingSecondary && (
          <h2 className="mt-3 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
            {headingSecondary}
          </h2>
        )}
      </div>
    </section>
  );
}

function PillarCardsBlock({ data }: { data: Record<string, unknown> }) {
  const cards = data.cards as Array<{
    title: string;
    description: string;
    link_text: string;
    link_url: string;
    icon: string;
    is_accent: boolean;
  }> | undefined;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {(cards || []).map((card, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className={`relative flex flex-col items-center text-center min-h-[380px] px-5 py-[70px] ${
                  card.is_accent ? "bg-primary text-white" : "bg-secondary text-white"
                }`}
                style={{ borderRadius: isEven ? "0 70px 0 70px" : "70px 0 70px 0" }}
              >
                <div className="mb-6 text-accent">
                  {ICON_MAP[card.icon] || <Rocket className="h-[74px] w-[74px]" />}
                </div>
                <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{card.title}</h2>
                <p className="text-base text-white max-w-xs">
                  {card.description}
                </p>
                {card.link_url && (
                  <Link
                    href={card.link_url}
                    className="inline-flex items-center gap-2 mt-8 text-sm font-medium uppercase tracking-wider text-accent hover:text-white"
                  >
                    {card.link_text || "Learn More"} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ParticipantCardBlock({ data }: { data: Record<string, unknown> }) {
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div
            className="relative flex flex-col items-center text-center w-full max-w-lg px-8 py-12"
            style={{
              background: "linear-gradient(135deg, #f5f0e8 0%, #e8f0e3 100%)",
              borderRadius: "70px 0 70px 0",
              border: "2px dashed #729D64",
            }}
          >
            <div
              className="flex items-center justify-center mb-5"
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                background: "#729D64",
              }}
            >
              <Compass className="h-9 w-9 text-white" />
            </div>
            <h2 className="text-[1.6rem] font-bold font-heading leading-[1.1em] text-foreground mb-2">
              Not sure where you fit?
            </h2>
            <p className="text-base text-muted-foreground max-w-sm">
              We get it. Maybe you&apos;re curious, exploring options, or just want to
              be part of something meaningful without a label. Join as a Participant —
              browse the hub, attend events, meet the community, and find your place
              when it feels right.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-accent font-medium">
              <span>No commitment required</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Explore freely</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Find your people</span>
            </div>
            {buttons && buttons.length > 0 ? (
              <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
                {buttons.map((btn, i) => (
                  <Link
                    key={i}
                    href={btn.link}
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                    style={{
                      color: "#729D64",
                      borderBottom: "2px solid #729D64",
                      paddingBottom: "4px",
                    }}
                  >
                    {btn.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="/register?role=participant"
                className="inline-flex items-center gap-2 mt-6 text-sm font-bold uppercase tracking-wider"
                style={{
                  color: "#729D64",
                  borderBottom: "2px solid #729D64",
                  paddingBottom: "4px",
                }}
              >
                I&apos;m Interested — Join as a Participant <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OverlayCardBlock({ data }: { data: Record<string, unknown> }) {
  const bgImage = data.background_image as string;
  const heading = data.heading as string;
  const description = data.description as string;
  const checklist = data.checklist as string[] | undefined;
  const linkText = data.link_text as string;
  const linkUrl = data.link_url as string;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative min-h-[380px] flex items-center overflow-hidden"
          style={{ borderRadius: "70px 0 70px 0" }}
        >
          {bgImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(114,157,100,0.49) 0%, #729D64 100%)",
            }}
          />
          <div className="relative z-10 px-10 py-[70px] w-full">
            {heading && (
              <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{heading}</h2>
            )}
            {description && (
              <p className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-white max-w-xl mb-6">{description}</p>
            )}
            {checklist && checklist.length > 0 && (
              <ul className="space-y-3 mb-8">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-lg font-bold">
                    <Check className="h-6 w-6 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {linkUrl && (
              <Link
                href={linkUrl}
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-accent hover:text-white"
              >
                {linkText || "Join Now"} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionBlock({ data }: { data: Record<string, unknown> }) {
  const badgeText = data.badge_text as string;
  const badgeLink = data.badge_link as string;
  const headings = data.headings as string[] | undefined;
  const paragraphs = data.paragraphs as string[] | undefined;
  const image = data.image as string;
  const buttonText = data.button_text as string;
  const buttonLink = data.button_link as string;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            {badgeText && (
              <span
                className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
                style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
              >
                {badgeLink ? <Link href={badgeLink}>{badgeText}</Link> : badgeText}
              </span>
            )}
            {headings?.map((h, i) => (
              <h2
                key={i}
                className={
                  i === 0
                    ? "text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground"
                    : "mt-3 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent"
                }
              >
                {h}
              </h2>
            ))}
            {paragraphs?.map((p, i) => (
              <p key={i} className={`${i === 0 ? "mt-6" : "mt-4"} text-muted-foreground leading-relaxed font-sans`}>
                {p}
              </p>
            ))}
            {buttonText && buttonLink && (
              <Link href={buttonLink} className="btn-sol btn-sol-primary inline-flex mt-8 text-sm uppercase">
                {buttonText}
              </Link>
            )}
          </div>
          {image && (
            <div className="relative" style={{ margin: "66px 0 0 23px" }}>
              <img src={image} alt="" className="w-full h-auto shadow-lg" style={{ borderRadius: "0 100px 0 100px" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function QuoteBlock({ data }: { data: Record<string, unknown> }) {
  const bgImage = data.background_image as string;
  const quoteText = data.quote_text as string;
  const secondaryText = data.secondary_text as string;

  return (
    <section className="relative py-[5em] px-[8em] text-center mt-[100px] overflow-hidden">
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-dark/55" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <Heart className="mx-auto mb-6 text-accent" style={{ fontSize: "94px", width: "94px", height: "94px" }} />
        {quoteText && (
          <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">
            &ldquo;{quoteText}&rdquo;
          </h2>
        )}
        {secondaryText && (
          <h2 className="mt-6 text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
            {secondaryText}
          </h2>
        )}
      </div>
    </section>
  );
}

function ProcessStepsBlock({ data }: { data: Record<string, unknown> }) {
  const badgeText = data.badge_text as string;
  const badgeLink = data.badge_link as string;
  const heading = data.heading as string;
  const subtext = data.subtext as string;
  const steps = data.steps as Array<{ title: string; description: string; icon: string }> | undefined;
  const variant = (data.variant as string) || "icons";
  const buttonText = data.button_text as string;
  const buttonLink = data.button_link as string;

  return (
    <section className="py-20 text-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {badgeText && (
          <span
            className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
            style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
          >
            {badgeLink ? <Link href={badgeLink}>{badgeText}</Link> : badgeText}
          </span>
        )}
        {heading && (
          <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">{heading}</h2>
        )}
        {subtext && (
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{subtext}</p>
        )}
        <div className="mt-16 grid gap-[40px] md:grid-cols-3 max-w-[1038px] mx-auto">
          {(steps || []).map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className="text-center p-10 bg-white"
                style={{
                  borderRadius: isEven ? "20px 0 20px 0" : "0 20px 0 20px",
                  boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                }}
              >
                {variant === "numbers" ? (
                  <div
                    className="mx-auto flex h-20 w-20 items-center justify-center text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent mb-6"
                    style={{ borderRadius: "0 16px 0 16px", border: "2px solid #EFC89A" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                ) : (
                  <div className="mx-auto flex items-center justify-center mb-6 text-accent" style={{ fontSize: "91px" }}>
                    {ICON_MAP[step.icon] || <FileText className="h-[91px] w-[91px]" />}
                  </div>
                )}
                <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{step.title}</h3>
                {step.description && (
                  <p className="mt-3 text-muted-foreground">{step.description}</p>
                )}
              </div>
            );
          })}
        </div>
        {buttonText && buttonLink && (
          <div className="mt-12">
            <Link
              href={buttonLink}
              className="btn-sol btn-sol-primary inline-flex uppercase text-sm"
              style={{ flexDirection: "row-reverse", gap: "22px" }}
            >
              <ArrowRight className="h-4 w-4" />
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Tools & Resources ──
function ToolsResourcesBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const paragraphs = data.paragraphs as string[] | undefined;
  const tags = data.tags as string[] | undefined;
  const image = data.image as string;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            {heading && (
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">{heading}</h2>
            )}
            {paragraphs?.map((p, i) => (
              <p key={i} className={i === 0 ? "mt-6 text-muted-foreground leading-relaxed" : "mt-4 text-muted-foreground leading-relaxed"}>{p}</p>
            ))}
            {tags && tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                {tags.map((tag) => (
                  <span key={tag} className="text-muted-foreground italic">*{tag}</span>
                ))}
              </div>
            )}
          </div>
          {image && (
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Feature Cards (2x2) ──
const FEATURE_ICON_MAP: Record<string, ReactNode> = {
  clipboard: <FileText className="h-[41px] w-[41px]" />,
  users: <Users className="h-[41px] w-[41px]" />,
  dollar: <Handshake className="h-[41px] w-[41px]" />,
  shield: <Rocket className="h-[41px] w-[41px]" />,
  graduation_cap: <GraduationCap className="h-[41px] w-[41px]" />,
  globe: <Globe className="h-[41px] w-[41px]" />,
};

function FeatureCardsBlock({ data }: { data: Record<string, unknown> }) {
  const cards = data.cards as Array<{ icon: string; title: string; description: string }> | undefined;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {(cards || []).map((card, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className="p-10 bg-white"
                style={{
                  borderRadius: isEven ? "20px 0 20px 0" : "0 20px 0 20px",
                  boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                }}
              >
                <div className="text-accent mb-4">
                  {FEATURE_ICON_MAP[card.icon] || <FileText className="h-[41px] w-[41px]" />}
                </div>
                <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{card.title}</h3>
                <p className="mt-3 text-muted-foreground">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Mentors (dark split section with checkmarks) ──
function MentorsBlock({ data }: { data: Record<string, unknown> }) {
  const bgImage = data.background_image as string;
  const badge = data.badge as string;
  const title = data.title as string;
  const subtext = data.subtext as string;
  const description = data.description as string;
  const description2 = data.description_2 as string | undefined;
  const checklist = data.checklist as string[] | undefined;
  const footnote = data.footnote as string;
  const buttonText = data.button_text as string;
  const buttonLink = data.button_link as string;
  const image = data.image as string;

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: "#000000" }}>
      {bgImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${bgImage})` }} />
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            {badge && (
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">{badge}</h2>
            )}
            {title && (
              <h3 className="mt-2 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">{title}</h3>
            )}
            {subtext && (
              <p className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">{subtext}</p>
            )}
            {description && (
              <p className="mt-6 text-white leading-relaxed">{description}</p>
            )}
            {description2 && (
              <p className="mt-4 text-white leading-relaxed">{description2}</p>
            )}
            {checklist && checklist.length > 0 && (
              <>
                <p className="mt-4 text-white font-bold">You&apos;ll gain:</p>
                <ul className="mt-2 space-y-2">
                  {checklist.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {footnote && <p className="mt-6 text-white italic">{footnote}</p>}
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="btn-sol uppercase text-sm text-white mt-8 inline-block"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EFC89A";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                {buttonText}
              </Link>
            )}
          </div>
          {image && (
            <div>
              <div className="aspect-square overflow-hidden shadow-lg" style={{ borderRadius: "0 100px 0 100px" }}>
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Investors (light split section) ──
function InvestorsBlock({ data }: { data: Record<string, unknown> }) {
  const badge = data.badge as string;
  const title = data.title as string;
  const paragraphs = data.paragraphs as string[] | undefined;
  const footnote = data.footnote as string;
  const buttonText = data.button_text as string;
  const buttonLink = data.button_link as string;
  const image = data.image as string;

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div>
            {badge && (
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">{badge}</h2>
            )}
            {title && (
              <h3 className="mt-2 text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">{title}</h3>
            )}
            {paragraphs?.map((p, i) => (
              <p key={i} className={`${i === 0 ? "mt-6" : "mt-4"} text-muted-foreground leading-relaxed`}>{p}</p>
            ))}
            {footnote && <p className="mt-4 text-muted-foreground italic">{footnote}</p>}
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="btn-sol uppercase text-sm text-white mt-8 inline-block"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EFC89A";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Benefit Cards (3 alternating cards) ──
function BenefitCardsBlock({ data }: { data: Record<string, unknown> }) {
  const cards = data.cards as Array<{ title: string; description: string; is_accent: boolean }> | undefined;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {(cards || []).map((card, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className={`p-10 ${card.is_accent ? "bg-primary text-white" : "bg-secondary text-white"}`}
                style={{ borderRadius: isEven ? "0 70px 0 70px" : "70px 0 70px 0" }}
              >
                <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{card.title}</h3>
                <p className="text-white leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTABannerBlock({ data }: { data: Record<string, unknown> }) {
  const bgImage = data.background_image as string;
  const headingPrimary = data.heading_primary as string;
  const headingSecondary = data.heading_secondary as string;
  const description = data.description as string;
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;

  return (
    <section className="relative py-24 text-center overflow-hidden">
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {headingSecondary && (
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">{headingSecondary}</h2>
        )}
        {headingPrimary && (
          <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1em] text-white">{headingPrimary}</h2>
        )}
        {description && (
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">{description}</p>
        )}
        {buttons && buttons.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-[10px] flex-wrap">
            {buttons.map((btn, i) =>
              btn.style === "outline" ? (
                <Link
                  key={i}
                  href={btn.link}
                  className="btn-sol uppercase text-sm text-white"
                  style={{
                    background: "#02010100",
                    border: "2px solid #EFC89A",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#729D64";
                    e.currentTarget.style.borderColor = "#729D64";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#EFC89A";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  {btn.label}
                </Link>
              ) : (
                <Link
                  key={i}
                  href={btn.link}
                  className="btn-sol uppercase text-sm text-white"
                  style={{
                    background: "#729D64",
                    borderRadius: "0 30px 0 30px",
                    padding: "20px 40px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EFC89A";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#729D64";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  {btn.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Existing blocks (unchanged from original)
function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const eyebrow = data.eyebrow as string;
  const heading = data.heading as string;
  const subtext = data.subtext as string;
  const bg = data.background_image as string;

  return (
    <section className="relative overflow-hidden py-24 text-center">
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">{eyebrow}</h2>
        )}
        {heading && (
          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">{heading}</h2>
        )}
        {subtext && (
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">{subtext}</p>
        )}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const body = data.body as string;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {heading && <h2 className="text-3xl font-bold font-heading text-center">{heading}</h2>}
        {body && (
          <div
            className="mt-6 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}
      </div>
    </section>
  );
}

function CardsBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const cards = data.cards as Array<{ title: string; description: string; image: string }> | undefined;

  return (
    <section className="py-16 bg-sage-light/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && <h2 className="text-3xl font-bold font-heading text-center mb-12">{heading}</h2>}
        <div className="grid gap-8 md:grid-cols-3">
          {(cards || []).map((card, i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {card.image && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                {card.title && <h3 className="text-lg font-bold font-heading">{card.title}</h3>}
                {card.description && <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const src = data.src as string;
  const alt = data.alt as string;
  const caption = data.caption as string;

  if (!src) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <figure>
          <img src={src} alt={alt || ""} className="w-full rounded-lg" />
          {caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

function CTABlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const subheading = data.subheading as string;
  const button_label = data.button_label as string;
  const button_link = data.button_link as string;

  return (
    <section className="py-24 text-center bg-footer">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">{heading}</h2>
        )}
        {subheading && (
          <h2 className="mt-4 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">{subheading}</h2>
        )}
        {button_label && button_link && (
          <a
            href={button_link}
            className="btn-sol uppercase text-sm text-white mt-10 inline-block"
            style={{
              background: "#729D64",
              borderRadius: "0 30px 0 30px",
              padding: "20px 40px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
          >
            {button_label}
          </a>
        )}
      </div>
    </section>
  );
}

function HTMLBlock({ data }: { data: Record<string, unknown> }) {
  const html = data.html as string;
  if (!html) return null;
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}

function StatsBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const stats = data.stats as Array<{ label: string; value: string }> | undefined;

  return (
    <section className="py-16 bg-sage-light/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && <h2 className="text-3xl font-bold font-heading text-center mb-12">{heading}</h2>}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(stats || []).map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold font-heading text-primary">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const images = data.images as string[] | undefined;
  const layout = data.layout as string;

  const isTwoCol = layout === "two-column";
  const isSingle = layout === "single";

  return (
    <section className="py-16">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isTwoCol ? "max-w-5xl" : isSingle ? "max-w-4xl" : "max-w-7xl"}`}>
        {heading && <h2 className="text-3xl font-bold font-heading text-center mb-12">{heading}</h2>}
        {isTwoCol ? (
          <div className="grid gap-8 md:grid-cols-2">
            {(images || []).filter(Boolean).map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : isSingle ? (
          <div className="aspect-[21/9] overflow-hidden" style={{ borderRadius: "0 40px 0 40px" }}>
            {(images || []).filter(Boolean).map((src, i) => (
              <img key={i} src={src} alt="" className="h-full w-full object-cover" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(images || []).filter(Boolean).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ColumnsBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const columns = (data.columns as number) || 2;
  const left = data.left as string;
  const right = data.right as string;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && <h2 className="text-3xl font-bold font-heading text-center mb-12">{heading}</h2>}
        <div
          className={cn(
            "grid gap-8",
            columns === 2 && "md:grid-cols-2",
            columns === 3 && "md:grid-cols-3",
            columns === 4 && "md:grid-cols-4"
          )}
        >
          {left && <div className="prose" dangerouslySetInnerHTML={{ __html: left }} />}
          {right && <div className="prose" dangerouslySetInnerHTML={{ __html: right }} />}
        </div>
      </div>
    </section>
  );
}

// ── Steward Intro (Whitney — Resonance Steward) ──
function StewardIntroBlock({ data }: { data: Record<string, unknown> }) {
  const name = (data.name as string) || "Whitney";
  const title = (data.title as string) || "SOL's Resonance Steward";
  const statement = data.statement as string;
  const principle = data.principle as string;
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[0_24px_0_24px] border border-primary/15 bg-sage-light/30 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                {name} — {title}
              </p>
              {statement && <p className="mt-3 text-muted-foreground leading-relaxed">{statement}</p>}
              {principle && (
                <p className="mt-4 border-l-2 border-primary/30 pl-4 text-sm italic text-muted-foreground">
                  {principle}
                </p>
              )}
            </div>
          </div>
          {buttons && buttons.length > 0 && (
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              {buttons.map((btn, i) =>
                btn.style === "outline" ? (
                  <Link
                    key={i}
                    href={btn.link}
                    className="btn-sol uppercase text-sm bg-white text-primary hover:bg-primary hover:text-white"
                  >
                    {btn.label}
                  </Link>
                ) : (
                  <Link key={i} href={btn.link} className="btn-sol btn-sol-primary uppercase text-sm">
                    {btn.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Principle Cards (icon + title + description trio) ──
const PRINCIPLE_ICON_MAP: Record<string, ReactNode> = {
  sparkles: <Sparkles className="mb-4 h-10 w-10 text-primary" />,
  compass: <Compass className="mb-4 h-10 w-10 text-primary" />,
  heart_handshake: <HeartHandshake className="mb-4 h-10 w-10 text-primary" />,
};

function PrincipleCardsBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const subtext = data.subtext as string;
  const cards = data.cards as Array<{ icon: string; title: string; description: string }> | undefined;

  return (
    <section className="bg-sage-light/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(heading || subtext) && (
          <div className="text-center">
            {heading && <h2 className="text-4xl font-bold font-heading">{heading}</h2>}
            {subtext && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtext}</p>}
          </div>
        )}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {(cards || []).map((card, i) => (
            <div key={i} className="rounded-[0_20px_0_20px] bg-white p-8 shadow-sm">
              {PRINCIPLE_ICON_MAP[card.icon] || <Sparkles className="mb-4 h-10 w-10 text-primary" />}
              <h3 className="text-xl font-bold font-heading">{card.title}</h3>
              <p className="mt-3 text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Centered Statement (icon + heading + body, e.g. "The Mirror Has No Identity") ──
function CenteredStatementBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const body = data.body as string;
  const accent = data.accent as boolean | undefined;
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;

  return (
    <section className={accent ? "bg-sage-light/30 py-20" : "py-20"}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
        </div>
        {heading && <h2 className="text-3xl font-bold font-heading">{heading}</h2>}
        {body && <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{body}</p>}
        {buttons && buttons.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {buttons.map((btn, i) =>
              btn.style === "outline" ? (
                <Link
                  key={i}
                  href={btn.link}
                  className="btn-sol uppercase text-sm bg-white text-primary hover:bg-primary hover:text-white"
                >
                  {btn.label}
                </Link>
              ) : (
                <Link key={i} href={btn.link} className="btn-sol btn-sol-primary uppercase text-sm">
                  {btn.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Hero with dual CTAs (e.g. become-a-member entry) ──
function HeroActionsBlock({ data }: { data: Record<string, unknown> }) {
  const eyebrow = data.eyebrow as string;
  const heading = data.heading as string;
  const highlight = data.highlight as string;
  const subtext = data.subtext as string;
  const icon = data.icon as string;
  const buttons = data.buttons as Array<{ label: string; link: string; style: string }> | undefined;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {icon && (
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" className="h-16 w-16" />
          </div>
        )}
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
              {heading} {highlight && <span className="text-primary">{highlight}</span>}
            </h1>
          )}
          {!eyebrow && heading && (
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
              {heading} {highlight && <span className="text-primary">{highlight}</span>}
            </h1>
          )}
          {subtext && <p className="mt-6 text-lg text-muted-foreground">{subtext}</p>}
          {buttons && buttons.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {buttons.map((btn, i) =>
                btn.style === "outline" ? (
                  <Link
                    key={i}
                    href={btn.link}
                    className="btn-sol uppercase text-sm bg-white text-primary hover:bg-primary hover:text-white"
                  >
                    {btn.label}
                  </Link>
                ) : (
                  <Link key={i} href={btn.link} className="btn-sol btn-sol-primary uppercase text-sm">
                    {btn.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Notice Banner (e.g. PMA notice) ──
function NoticeBannerBlock({ data }: { data: Record<string, unknown> }) {
  const text = data.text as string;
  const linkText = data.link_text as string;
  const linkUrl = data.link_url as string;

  return (
    <section className="bg-primary/5 py-8 border-y border-primary/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {text}
          {linkText && linkUrl && (
            <>
              {" "}
              <Link href={linkUrl} className="text-primary underline">
                {linkText}
              </Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

// ── FAQ List ──
function FaqListBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const faqs = data.faqs as Array<{ q: string; a: string }> | undefined;

  return (
    <section className="bg-sage-light/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">{heading}</h2>
          </div>
        )}
        <div className="mt-12 space-y-6">
          {(faqs || []).map((faq, i) => (
            <div key={i} className="rounded-[0_10px_0_10px] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold font-heading">{faq.q}</h3>
              <p className="mt-2 text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RENDERERS: Record<string, (props: { data: Record<string, unknown> }) => ReactNode> = {
  hero: HeroBlock,
  hero_slideshow: HeroSlideshowBlock,
  tagline: TaglineBlock,
  pillar_cards: PillarCardsBlock,
  participant_card: ParticipantCardBlock,
  overlay_card: OverlayCardBlock,
  mission: MissionBlock,
  quote: QuoteBlock,
  process_steps: ProcessStepsBlock,
  cta_banner: CTABannerBlock,
  tools_resources: ToolsResourcesBlock,
  feature_cards: FeatureCardsBlock,
  mentors: MentorsBlock,
  investors: InvestorsBlock,
  benefit_cards: BenefitCardsBlock,
  text: TextBlock,
  cards: CardsBlock,
  image: ImageBlock,
  cta: CTABlock,
  html: HTMLBlock,
  stats: StatsBlock,
  gallery: GalleryBlock,
  columns: ColumnsBlock,
  steward_intro: StewardIntroBlock,
  principle_cards: PrincipleCardsBlock,
  centered_statement: CenteredStatementBlock,
  hero_actions: HeroActionsBlock,
  notice_banner: NoticeBannerBlock,
  faq_list: FaqListBlock,
};

export function DynamicPage({ sections }: { sections: Section[] }) {
  return (
    <>
      {(sections || []).map((section) => {
        const Renderer = RENDERERS[section.type];
        if (!Renderer) return null;
        return <Renderer key={section.id} data={section.data} />;
      })}
    </>
  );
}
