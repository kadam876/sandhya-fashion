// Skeleton for stat cards (Dashboard, OwnerDashboard)
const StatCardSkeleton = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-6 animate-pulse`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-7 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
    ))}
  </div>
);

export default StatCardSkeleton;
