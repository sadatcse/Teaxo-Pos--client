import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ImageUpload from '../../config/ImageUploadcpanel';

const CompanyModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialData = {}, isEditing }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({ ...prev, logo: url }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><FiX/></button>
                <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Branch' : 'Add New Branch'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Company Name" value={formData.name || ''} onChange={handleChange} className="input input-bordered w-full" required />
                        <input type="text" name="branch" placeholder="Branch Name (e.g., teaxo)" value={formData.branch || ''} onChange={handleChange} className="input input-bordered w-full" required />
                        <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} className="input input-bordered w-full" required />
                        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone || ''} onChange={handleChange} className="input input-bordered w-full" required />
                    </div>
                    <textarea name="address" placeholder="Address" value={formData.address || ''} onChange={handleChange} className="textarea textarea-bordered w-full" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" name="website" placeholder="Website (Optional)" value={formData.website || ''} onChange={handleChange} className="input input-bordered w-full" />
                       <input type="text" name="binNumber" placeholder="BIN Number (Optional)" value={formData.binNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
                       <input type="text" name="tinNumber" placeholder="TIN Number (Optional)" value={formData.tinNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <ImageUpload setImageUrl={handleImageUpload} />
                    {formData.logo && <img src={formData.logo} alt="logo preview" className="w-24 h-24 object-contain border rounded-md"/>}
                    
                    <div className="modal-action pt-4 border-t">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyModal;