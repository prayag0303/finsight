export default function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = {
    primary: 'border-primary-500',
    white: 'border-white',
    slate: 'border-slate-400',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} rounded-full border-2 border-t-transparent ${colors[color]} animate-spin`}
      />
    </div>
  );
}
