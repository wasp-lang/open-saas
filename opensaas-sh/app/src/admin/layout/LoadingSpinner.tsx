const LoadingSpinner = () => {
  return (
    <div className='flex py-10 items-center justify-center'>
      <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
    </div>
  );
};

export default LoadingSpinner;
