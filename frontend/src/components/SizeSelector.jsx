import { useState } from 'react';

const SizeSelector = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  
  const sizes = ['M', 'L', 'XL', 'XXL'];
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 mr-2">Size:</span>
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => setSelectedSize(size)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedSize === size
              ? 'bg-[#00B67A] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
