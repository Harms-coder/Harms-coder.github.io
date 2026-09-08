interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-2 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">{title}</h1>
      <p className="text-sm text-(--color-text-muted)">{description}</p>
    </div>
  );
}
