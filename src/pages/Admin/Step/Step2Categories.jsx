import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const Step2Categories = ({ data, onNext, onPrev }) => {
    const [categories, setCategories] = useState(data.categories.length > 0 ? data.categories : [{ categoryName: '', serial: 1 }]);

    const handleAddRow = () => {
        setCategories([...categories, { categoryName: '', serial: categories.length + 1 }]);
    };

    const handleRemoveRow = (index) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const handleChange = (index, e) => {
        const newCategories = [...categories];
        newCategories[index][e.target.name] = e.target.value;
        setCategories(newCategories);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Add Product Categories (Bulk)</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map((cat, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" name="categoryName" placeholder="Category Name" value={cat.categoryName} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full" />
                        <input type="number" name="serial" placeholder="Serial" value={cat.serial} onChange={(e) => handleChange(index, e)} className="input input-bordered w-24" />
                        <button onClick={() => handleRemoveRow(index)} className="btn btn-ghost text-red-500"><FiTrash2/></button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddRow} className="btn btn-sm btn-ghost mt-2"><FiPlus/> Add Row</button>
            <div className="flex justify-between mt-6">
                <button onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button onClick={() => onNext({ categories })} className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </div>
    );
};

export default Step2Categories;