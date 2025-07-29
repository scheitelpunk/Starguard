export function LoadingVoid() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-32 h-32 rounded-full void-portal" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-consciousness-500/20 animate-consciousness-pulse" />
        </div>
      </div>
    </div>
  );
}