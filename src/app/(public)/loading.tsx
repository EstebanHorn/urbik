export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-white pt-15 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-geora-g200 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-geora-g100 overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-56 bg-geora-g200" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-geora-g300 rounded-full" />
                <div className="h-4 w-4/5 bg-geora-g300 rounded-full" />
                <div className="h-3 w-3/5 bg-geora-g200 rounded-full" />
                <div className="h-5 w-2/5 bg-geora-g300 rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
