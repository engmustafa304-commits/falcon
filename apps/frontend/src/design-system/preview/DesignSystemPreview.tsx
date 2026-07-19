import {
  Badge,
  Button,
  Card,
  CarImageCard,
  Chip,
  DataTablePreview,
  DialogPreview,
  EmptyState,
  Input,
  LoadingState,
  PageShell,
  SectionContainer,
  Skeleton,
  Tag
} from "@/design-system/primitives";
import { BrandBadge, BrandMark, BrandWordmark, Logo } from "@/design-system/brand";
import { Typography } from "@/design-system/foundation/Typography";
import { colorSwatches } from "@/design-system/tokens";
import { Check, Search } from "lucide-react";
import type { ReactNode } from "react";

const typographySamples = [
  {
    body: "واجهة دقيقة وهادئة تمنح فرق السيارات نظاماً تشغيلياً سريعاً وواضحاً.",
    dir: "rtl",
    label: "Arabic / SA Hazm",
    lang: "ar",
    title: "فالكون نظام تشغيلي فاخر للسيارات"
  },
  {
    body: "A precise, minimal operating system foundation for high-scale automotive teams.",
    dir: "ltr",
    label: "English / Inter",
    lang: "en",
    title: "Falcon Automotive Operating System"
  }
] as const;

export function DesignSystemPreview() {
  return (
    <PageShell>
      <SectionContainer className="bg-white py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-8">
            <BrandBadge label="Premium Automotive Operating System" />
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-normal text-dark-900 md:text-7xl">
                Falcon identity system
              </h1>
              <p className="max-w-2xl text-lg font-normal leading-8 text-slate-600">
                A quiet, premium, technology-first design language for an
                enterprise automotive operating system. White stays dominant;
                turquoise appears only as a precise accent.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button isLoading variant="accent">
                Loading
              </Button>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-border-subtle bg-section p-4 shadow-soft">
            <div className="rounded-[2rem] border border-border-subtle bg-white p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Logo language="en" />
                <Logo language="ar" />
                <Logo markOnly />
              </div>
              <div className="mt-8 grid grid-cols-4 gap-4">
                {[16, 32, 64, 128].map((size) => (
                  <div
                    className="flex items-center justify-center rounded-2xl bg-section p-4"
                    key={size}
                  >
                    <BrandMark
                      className="shrink-0"
                      styleSize={size}
                      title={`Falcon mark ${size}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="bg-section">
        <PreviewBlock eyebrow="01 / Tokens" title="Color Palette">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {colorSwatches.map((color) => (
              <Card className="p-4" key={color.token}>
                <div
                  className="h-24 rounded-2xl border border-border-subtle"
                  style={{ backgroundColor: color.value }}
                />
                <div className="mt-4 space-y-1">
                  <h3 className="text-sm font-semibold text-dark-900">
                    {color.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{color.token}</p>
                    <code className="text-xs font-medium text-slate-500">
                      {color.value}
                    </code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 rounded-brand-lg border border-border-subtle bg-white p-5 shadow-subtle">
            <div className="h-20 rounded-2xl falcon-gradient" />
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Gradient use is intentionally rare: #43BFC7 to #36B4BC, reserved
              for premium accents and never as a dominant page treatment.
            </p>
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer>
        <PreviewBlock eyebrow="02 / Typography" title="Typography System">
          <Typography />
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer>
        <PreviewBlock eyebrow="03 / Typography Samples" title="Arabic and English">
          <div className="grid gap-5 lg:grid-cols-2">
            {typographySamples.map((sample) => (
              <Card
                className="p-8"
                dir={sample.dir}
                key={sample.lang}
                lang={sample.lang}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {sample.label}
                </p>
                <h3 className="mt-5 text-4xl font-semibold leading-[1.18] text-dark-900">
                  {sample.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  {sample.body}
                </p>
              </Card>
            ))}
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer className="bg-section">
        <PreviewBlock eyebrow="04 / Controls" title="Buttons and Inputs">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button disabled>Disabled</Button>
                <Button isLoading variant="secondary">
                  Loading
                </Button>
              </div>
            </Card>
            <Card>
              <div className="grid gap-4">
                <Input label="Search input" placeholder="Search Falcon systems" />
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-border-subtle bg-white px-4 text-sm text-slate-500">
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                  Icon input pattern
                </label>
              </div>
            </Card>
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer>
        <PreviewBlock eyebrow="05 / Surfaces" title="Cards, Badges, Chips, Tags">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-500">Metric Card</p>
                <p className="mt-3 text-4xl font-semibold text-dark-900">
                  100K+
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                A restrained card style with more whitespace and less shadow.
              </p>
            </Card>
            <Card className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Neutral</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="warning">Warning</Badge>
                <Badge tone="danger">Danger</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip>Enterprise</Chip>
                <Chip>White-label</Chip>
                <Tag>RTL</Tag>
                <Tag>API</Tag>
              </div>
            </Card>
            <Card className="space-y-4">
              {["Aligned spacing", "Lucide stroke consistency", "No clutter"].map(
                (item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/10 text-dark-900">
                      <Check className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-medium text-dark-900">
                      {item}
                    </span>
                  </div>
                )
              )}
            </Card>
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer className="bg-section">
        <PreviewBlock eyebrow="06 / Signature" title="Falcon Car Image Card">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <CarImageCard />
            <Card className="space-y-4">
              <h3 className="text-2xl font-semibold leading-tight text-dark-900">
                The image becomes the hero.
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                Large media, beautiful cropping, a quiet bottom gradient, and
                contact actions revealed only on hover. This gives future
                vehicle surfaces a premium signature without becoming a typical
                marketplace pattern.
              </p>
            </Card>
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer>
        <PreviewBlock eyebrow="07 / System States" title="Tables, Dialogs, Empty, Loading">
          <div className="grid gap-6 lg:grid-cols-2">
            <DataTablePreview />
            <DialogPreview />
            <EmptyState />
            <Card className="space-y-4">
              <LoadingState />
              <Skeleton className="h-12" />
              <Skeleton className="h-24" />
            </Card>
          </div>
        </PreviewBlock>
      </SectionContainer>

      <SectionContainer className="bg-dark-900">
        <PreviewBlock
          eyebrow="08 / Identity"
          inverse
          title="Logo Variations"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white">
              <Logo language="en" />
            </Card>
            <Card className="bg-white">
              <Logo language="ar" />
            </Card>
            <div className="rounded-brand-lg border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-4">
                <BrandMark className="h-12 w-12" />
                <BrandWordmark className="text-white" language="en" />
              </div>
            </div>
          </div>
        </PreviewBlock>
      </SectionContainer>
    </PageShell>
  );
}

function PreviewBlock({
  children,
  eyebrow,
  inverse = false,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  inverse?: boolean;
  title: string;
}) {
  return (
    <section>
      <div className="mb-8">
        <p
          className={
            inverse
              ? "text-sm font-semibold text-accent-500"
              : "text-sm font-semibold text-accent-500"
          }
        >
          {eyebrow}
        </p>
        <h2
          className={
            inverse
              ? "mt-2 text-3xl font-semibold leading-tight text-white"
              : "mt-2 text-3xl font-semibold leading-tight text-dark-900"
          }
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
