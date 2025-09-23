import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const Step3Products = ({ data, onNext, onPrev }) => {
    const [products, setProducts] = useState(data.products.length > 0 ? data.products : [{ productName: '', category: '', price: '' }]);
    const availableCategories = data.categories.map(c => c.categoryName);

    const handleAddRow = () => setProducts([...products, { productName: '', category: '', price: '' }]);
    const handleRemoveRow = (index) => setProducts(products.filter((_, i) => i !== index));
    const handleChange = (index, e) => {
        const newProducts = [...products];
        newProducts[index][e.target.name] = e.target.value;
        setProducts(newProducts);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Add Products (Bulk)</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((prod, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <input type="text" name="productName" placeholder="Product Name" value={prod.productName} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full md:col-span-2" />
                        <select name="category" value={prod.category} onChange={(e) => handleChange(index, e)} className="select select-bordered w-full">
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                           <input type="number" name="price" placeholder="Price" value={prod.price} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full" />
                           <button onClick={() => handleRemoveRow(index)} className="btn btn-ghost text-red-500"><FiTrash2/></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleAddRow} className="btn btn-sm btn-ghost mt-2"><FiPlus/> Add Product</button>
            <div className="flex justify-between mt-6">
                <button onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button onClick={() => onNext({ products })} className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </div>
    );
};

export default Step3Products;