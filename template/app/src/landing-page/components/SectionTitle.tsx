export default function SectionTitle({
  title,
  subtitle,
}: {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
}) {
  const titleElement =
    typeof title === 'string' ? (
      <p className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>{title}</p>
    ) : (
      title
    );
  const subtitleElement =
    typeof subtitle === 'string' ? (
      <p className='mt-6 text-lg leading-8 text-muted-foreground'>{subtitle}</p>
    ) : (
      subtitle
    );

  return (
    <div className='mx-auto max-w-2xl text-center'>
      {titleElement}
      {subtitleElement}
    </div>
  );
}
