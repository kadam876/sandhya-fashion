// Skeleton for table rows (Orders, AdminUsers, ShopManagement)
const TableRowSkeleton = ({ cols = 5, rows = 8 }) => (
  <div className="animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-gray-100">
        {[...Array(cols)].map((_, j) => (
          <div key={j} className={`h-4 bg-gray-200 rounded ${j === 0 ? 'w-1/4' : 'flex-1'}`} />
        ))}
      </div>
    ))}
  </div>
);

export default TableRowSkeleton;
