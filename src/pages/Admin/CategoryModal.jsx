import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const CategoryModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialData = {}, isEditing, branches }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-lg relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><FiX/></button>
                <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="categoryName" placeholder="Category Name" value={formData.categoryName || ''} onChange={handleChange} className="input input-bordered w-full" required />
                    <input type="number" name="serial" placeholder="Serial Number" value={formData.serial || ''} onChange={handleChange} className="input input-bordered w-full" required />
                    
                    <select name="branch" value={formData.branch || ''} onChange={handleChange} className="select select-bordered w-full" required>
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                    
                    <div className="form-control">
                        <label className="cursor-pointer label">
                            <span className="label-text">Is Active?</span>
                            <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="toggle toggle-success" />
                        </label>
                    </div>

                    <div className="modal-action pt-4 border-t">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;