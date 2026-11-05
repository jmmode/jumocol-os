type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
};

export function PageHeader({ eyebrow, title, description, badge }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-brand-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-brand-text sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        <span className="brand-accent-rule mt-4 block h-1 w-20 rounded-full" />
        <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-muted sm:text-[15px]">{description}</p>
      </div>
      {badge ? (
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-brand-border bg-brand-background px-4 py-2 text-xs font-bold text-brand-muted shadow-sm">
          <span className="size-2 rounded-full bg-brand-blue" />
          {badge}
        </span>
      ) : null}
    </header>
  );
}
