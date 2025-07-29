
import CookingAnimation from "../CookingAnimation";
import Food from "../../assets/Raw-Image/Food.jpg"; 
const ProductSelection = ({ products, categories, selectedCategory, setSelectedCategory, addProduct, loading }) => {
  return (
    // Responsive width: full width on small screens, 7/12 on large screens
    <div className="w-full lg:w-4/6 p-1 md:p-6 font-inter">
      {/* Categories */}
<div className="flex flex-wrap gap-2 sm:gap-3 mb-8 p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={`
        px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
        ${selectedCategory === category
          ? "bg-blue-600 text-white shadow-lg transform scale-105"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 shadow-md"
        }
      `}
    >
      {category}
    </button>
  ))}
</div>

      {/* Products Display */}
      {/* Responsive height: adjusts based on viewport, table scrolls horizontally if needed */}
      <div className="overflow-y-auto   ">
        {loading ? (
          <CookingAnimation />
        ) : (
          <div className="overflow-x-auto"> {/* Allows horizontal scrolling for table on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white sticky top-0 shadow-md">
                <tr>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wider rounded-tl-xl">Picture</th>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products
                  .filter((product) => product.category === selectedCategory)
                  .map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        <img
                          src={product.photo ? product.photo : Food}
                          alt={product.productName || "Food item"}
                          className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-md shadow-sm border border-gray-200"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/E0E0E0/666666?text=No+Image"; }}
                        />
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-gray-800 text-sm md:text-base">{product.productName}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700 text-sm md:text-base">{product.price} TK</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                        <button
                          onClick={() => addProduct(product)}
                          className="bg-green-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full hover:bg-green-700 transition-colors duration-300 ease-in-out shadow-md text-xs md:text-sm font-semibold transform hover:scale-105"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductSelection;
