export default function SectionTitle({
  title,
  description,
}: {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  titleComponent?: React.ReactNode;
}) {
  const titleElement =
    typeof title === 'string' ? (
      <h3 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>{title}</h3>
    ) : (
      title
    );
  const descriptionElement =
    typeof description === 'string' ? (
      <p className='mt-4 text-lg leading-8 text-muted-foreground'>{description}</p>
    ) : (
      description
    );

  return (
    <div className='mx-auto max-w-2xl text-center mb-8'>
      {titleElement}
      {descriptionElement}
    </div>
  );
}
