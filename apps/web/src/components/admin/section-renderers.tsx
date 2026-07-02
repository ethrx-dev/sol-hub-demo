import type { ReactNode } from "react";

interface Section {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const heading = data.heading as string;
  const subtext = data.subtext as string;
  const bg = data.background_image as string;

  return (
    <section className="relative overflow-hidden py-24">
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div className={cn("absolute inset-0", bg ? "bg-black/50" : "bg-gradient-to-br from-sage-light/70 via-background/80 to-sage-light/60")} />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {heading && (
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[5.2rem] leading-[1.1] font-heading">
            {heading}
          </h1>
        )}
        {subtext && (
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{subtext}</p>
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
  const button_label = data.button_label as string;
  const button_link = data.button_link as string;

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        {heading && <h2 className="text-4xl font-bold font-heading">{heading}</h2>}
        {(button_label && button_link) ? (
          <a
            href={button_link}
            className="btn-sol btn-sol-primary mt-8 inline-block uppercase text-sm"
          >
            {button_label}
          </a>
        ) : null}
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

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && <h2 className="text-3xl font-bold font-heading text-center mb-12">{heading}</h2>}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(images || []).filter(Boolean).map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-lg">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
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

const RENDERERS: Record<string, (props: { data: Record<string, unknown> }) => ReactNode> = {
  hero: HeroBlock,
  text: TextBlock,
  cards: CardsBlock,
  image: ImageBlock,
  cta: CTABlock,
  html: HTMLBlock,
  stats: StatsBlock,
  gallery: GalleryBlock,
  columns: ColumnsBlock,
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
