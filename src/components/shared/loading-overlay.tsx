export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/10 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-5 py-4 shadow-lg">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-slate-700">Carregando...</p>
      </div>
    </div>
  );
}
