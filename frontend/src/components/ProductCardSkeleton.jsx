const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100/80 overflow-hidden animate-pulse flex flex-col h-full">
    <div className="w-full h-72 bg-gray-100" />
    <div className="p-5 space-y-4 flex flex-col flex-grow">
      <div>
        <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3" />
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="h-7 bg-gray-200 rounded-lg w-1/3 mb-4" />
        <div className="flex space-x-2">
          <div className="flex-1 h-12 bg-gray-100 rounded-2xl border-2 border-gray-50" />
          <div className="flex-[1.5] h-12 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
