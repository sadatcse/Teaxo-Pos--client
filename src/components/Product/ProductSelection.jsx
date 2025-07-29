
import CookingAnimation from "../CookingAnimation";
import Food from "../../assets/Raw-Image/Food.jpg"; 

// ProductSelection Component
const ProductSelection = ({ products, categories, selectedCategory, setSelectedCategory, addProduct, loading }) => {
  return (
    <div className="w-full lg:w-4/6">
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4 border p-2 rounded shadow-md">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
              ${selectedCategory === category
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Display */}
      <div className="overflow-y-auto h-[calc(100vh-200px)] custom-scrollbar">
        {loading ? (
          <CookingAnimation />
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Picture</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Rate</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((product) => product.category === selectedCategory)
                .map((product) => (
                  <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.photo ? product.photo : Food}
                        alt={product.productName || "Food item"}
                        className="h-16 w-16 object-cover rounded-md shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/E0E0E0/666666?text=No+Image"; }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{product.productName}</td>
                    <td className="px-4 py-3 text-gray-700">{product.price} TK</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => addProduct(product)}
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-200 ease-in-out shadow-md"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default ProductSelection;
