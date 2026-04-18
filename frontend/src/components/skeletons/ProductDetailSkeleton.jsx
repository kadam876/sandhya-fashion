// Skeleton for ProductDetail page
const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image */}
      <div className="space-y-4">
        <div className="w-full h-96 bg-gray-200 rounded-xl" />
        <div className="flex space-x-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Details */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded w-32" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="flex space-x-3 pt-4">
          <div className="h-12 bg-gray-200 rounded-lg flex-1" />
          <div className="h-12 bg-gray-200 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
