export default function SectionTitle({
  title,
  subtitle,
}: {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  titleComponent?: React.ReactNode;
}) {
  const titleElement =
    typeof title === 'string' ? (
      <h4 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>{title}</h4>
    ) : (
      title
    );
  const subtitleElement =
    typeof subtitle === 'string' ? (
      <p className='mt-4 text-lg leading-8 text-muted-foreground'>{subtitle}</p>
    ) : (
      subtitle
    );

  return (
    <div className='mx-auto max-w-2xl text-center mb-8'>
      {titleElement}
      {subtitleElement}
    </div>
  );
}
