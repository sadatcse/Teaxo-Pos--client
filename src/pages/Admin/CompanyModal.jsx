import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUploadCloud, FiTrash } from 'react-icons/fi';
import axios from 'axios'; // Ensure axios is installed

// If you use a specific image hosting service (like ImgBB), put the key here
// const IMAGE_HOSTING_KEY = "YOUR_IMGBB_API_KEY"; 
// const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

const CompanyModal = ({ isOpen, onClose, onSubmit, isSubmitting, isEditing, initialData }) => {
    
    const [uploading, setUploading] = useState(false);

    // 1. Initialize Form State
    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        email: '',
        ownerEmail: '',
        phone: '',
        address: '',
        binNumber: '',
        tinNumber: '',
        website: '',
        logo: '', // This will store the URL after upload
        otherInformation: ''
    });

    // 2. Populate form when opening for Edit
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                branch: initialData.branch || '',
                email: initialData.email || '',
                ownerEmail: initialData.ownerEmail || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                binNumber: initialData.binNumber || '',
                tinNumber: initialData.tinNumber || '',
                website: initialData.website || '',
                logo: initialData.logo || '',
                otherInformation: initialData.otherInformation || ''
            });
        } else if (!isOpen) {
            setFormData({
                name: '', branch: '', email: '', ownerEmail: '', phone: '',
                address: '', binNumber: '', tinNumber: '', website: '',
                logo: '', otherInformation: ''
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Image Upload Function
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // REPLACE THIS URL with your actual backend upload endpoint or ImgBB/Cloudinary URL
            // Example: const res = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_KEY', uploadData);
            
            // For now, I'm simulating a backend call. 
            // CHANGE THIS to: const { data } = await axios.post('/your-backend/upload', uploadData);
            
            // *** REAL IMPLEMENTATION EXAMPLE (Uncomment and use your API) ***
            /*
            const res = await axios.post(
                `https://api.imgbb.com/1/upload?key=YOUR_API_KEY_HERE`, 
                uploadData
            );
            const imageUrl = res.data.data.url;
            */

            // --- MOCK RESPONSE (Remove this block when you add your API URL above) ---
            // Simulating a delay and returning a fake URL for testing
             const imageUrl = await new Promise((resolve) => {
                setTimeout(() => resolve(URL.createObjectURL(file)), 1000); 
             });
             // --------------------------------------------------------------------

            // Set the URL to state so it doesn't disappear
            setFormData(prev => ({ ...prev, logo: imageUrl }));
            
        } catch (error) {
            console.error("Image upload failed:", error);
            // You can add a toast notification here
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, logo: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Edit Branch' : 'Add New Branch'}
                    </h2>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Company Name *</span></label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Acme Corp" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Branch Name *</span></label>
                            <input required type="text" name="branch" value={formData.branch} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Dhaka HQ" />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Company Email *</span></label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full" placeholder="info@company.com" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Owner Email *</span></label>
                            <input required type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} className="input input-bordered w-full bg-yellow-50" placeholder="owner@gmail.com" />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Phone Number *</span></label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="input input-bordered w-full" placeholder="+880 1..." />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Website</span></label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="input input-bordered w-full" placeholder="https://..." />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">BIN Number</span></label>
                            <input type="text" name="binNumber" value={formData.binNumber} onChange={handleChange} className="input input-bordered w-full" placeholder="Business ID Number" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">TIN Number</span></label>
                            <input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleChange} className="input input-bordered w-full" placeholder="Tax ID Number" />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Address *</span></label>
                        <textarea required name="address" value={formData.address} onChange={handleChange} className="textarea textarea-bordered h-20" placeholder="Full office address"></textarea>
                    </div>

                    {/* --- NEW LOGO UPLOAD SECTION --- */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Company Logo</span></label>
                        
                        <div className="flex items-start gap-4">
                            {/* 1. File Input */}
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    onChange={handleImageUpload} 
                                    className="file-input file-input-bordered w-full" 
                                    accept="image/*"
                                    disabled={uploading}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {uploading ? "Uploading..." : "Supported: JPG, PNG, JPEG"}
                                </div>
                            </div>

                            {/* 2. Preview Area */}
                            <div className="w-24 h-24 border rounded-lg flex items-center justify-center relative bg-gray-50 overflow-hidden">
                                {uploading ? (
                                    <span className="loading loading-spinner text-blue-600"></span>
                                ) : formData.logo ? (
                                    <>
                                        <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            title="Remove Image"
                                        >
                                            <FiTrash size={12} />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400 text-center px-1">No Image</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Hidden input to ensure URL is submitted */}
                        <input type="hidden" name="logo" value={formData.logo} />
                    </div>
                    
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Other Information</span></label>
                        <textarea name="otherInformation" value={formData.otherInformation} onChange={handleChange} className="textarea textarea-bordered h-20"></textarea>
                    </div>

                    {/* Actions */}
                    <div className="modal-action mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting || uploading}>Cancel</button>
                        <button 
                            type="submit" 
                            className={`btn bg-blue-600 hover:bg-blue-700 text-white ${isSubmitting || uploading ? 'loading' : ''}`} 
                            disabled={isSubmitting || uploading}
                        >
                            {(isSubmitting || uploading) ? 'Processing...' : <><FiSave className="mr-2"/> Save Branch</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyModal;