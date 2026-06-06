export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white pt-15">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-6 mb-10 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-urbik-g200" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-urbik-g200 rounded-full" />
            <div className="h-4 w-32 bg-urbik-g100 rounded-full" />
          </div>
        </div>
        <div className="rounded-3xl bg-urbik-g100 h-64 animate-pulse" />
      </div>
    </div>
  );
}
