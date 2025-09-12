import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaUtensils } from "react-icons/fa";
import CookingAnimation from "../CookingAnimation";
import Food from "../../assets/Raw-Image/Food.jpg";


const ProductSelection = ({ products, categories, selectedCategory, setSelectedCategory, addProduct, loading }) => {
  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
    exit: { opacity: 0, x: -50 },
  };

  return (
    // Overall Layout & Theme
    <div className="w-full lg:w-4/6 p-4 sm:p-6 lg:p-8 bg-base-200 font-inter">
      {/* Page Load Animation & Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="card bg-base-100 shadow-xl p-6"
      >
    

        {/* Section: Categories */}
        <div className="mb-8">
    
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${
                  selectedCategory === category ? "btn bg-[#1A77F2]" : "btn-ghost"
                } rounded-full`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section: Products Display with fixed height and scroll */}
        <div className="h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <CookingAnimation />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table min-w-full">
                {/* Table Header */}
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-600 text-white">
                    <th className="rounded-tl-lg border border-slate-300 px-4 py-3">Picture</th>
                    <th className="border border-slate-300 px-4 py-3">Product</th>
                    <th className="border border-slate-300 px-4 py-3">Rate</th>
                    <th className="rounded-tr-lg border border-slate-300 px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products
                      .filter((product) => product.category === selectedCategory)
                      .map((product) => (
                        <motion.tr
                          key={product._id}
                          layout
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="hover"
                        >
                          <td className="border border-slate-300 p-2 md:p-3">
                            <img
                              src={product.photo || Food}
                              alt={product.productName || "Food item"}
                              className="h-14 w-14 object-cover rounded-md shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/64x64/E0E0E0/666666?text=No+Image";
                              }}
                            />
                          </td>
                          <td className="font-medium text-slate-800 border border-slate-300">
                            {product.productName}
                          </td>
                          <td className="text-slate-700 border border-slate-300">{product.price} TK</td>
                          <td className="text-center border border-slate-300">
                            <motion.button
                              onClick={() => addProduct(product)}
                              className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaPlus />
                              <span className="hidden sm:inline">Add</span>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductSelection;