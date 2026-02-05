import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

const Step1Company = ({ data, onNext }) => {
    // Initialize state with existing data or empty object to prevent uncontrolled input warnings
    const [companyData, setCompanyData] = useState(data.company || {});

    const handleChange = (e) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext({ company: companyData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Branch Information</h2>
            
            {/* Row 1: Basic Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Company Name <span className="text-red-500">*</span></span>
                    </label>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Techno Resturant" 
                        value={companyData.name || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                        required 
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Branch Name <span className="text-red-500">*</span></span>
                    </label>
                    <input 
                        type="text" 
                        name="branch" 
                        placeholder="e.g. Dhanmondi Branch" 
                        value={companyData.branch || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                        required 
                    />
                </div>
            </div>

            {/* Row 2: Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Branch Email <span className="text-red-500">*</span></span>
                    </label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="branch@example.com" 
                        value={companyData.email || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                        required 
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Branch Phone <span className="text-red-500">*</span></span>
                    </label>
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="+880 1XXX XXXXXX" 
                        value={companyData.phone || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                        required 
                    />
                </div>
            </div>

            {/* Row 3: Owner & Web */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Owner Email <span className="text-red-500">*</span></span>
                    </label>
                    <input 
                        type="email" 
                        name="ownerEmail" 
                        placeholder="owner@example.com" 
                        value={companyData.ownerEmail || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                        required 
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Website</span>
                    </label>
                    <input 
                        type="text" 
                        name="website" 
                        placeholder="https://www.example.com" 
                        value={companyData.website || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                    />
                </div>
            </div>

            {/* Row 4: Legal (BIN/TIN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">BIN Number</span>
                    </label>
                    <input 
                        type="text" 
                        name="binNumber" 
                        placeholder="Enter BIN Number" 
                        value={companyData.binNumber || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">TIN Number</span>
                    </label>
                    <input 
                        type="text" 
                        name="tinNumber" 
                        placeholder="Enter TIN Number" 
                        value={companyData.tinNumber || ''} 
                        onChange={handleChange} 
                        className="input input-bordered w-full" 
                    />
                </div>
            </div>

            {/* Row 5: Logo URL */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Logo URL</span>
                </label>
                <input 
                    type="text" 
                    name="logo" 
                    placeholder="https://example.com/logo.png" 
                    value={companyData.logo || ''} 
                    onChange={handleChange} 
                    className="input input-bordered w-full" 
                />
            </div>

            {/* Row 6: Addresses & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Branch Address <span className="text-red-500">*</span></span>
                    </label>
                    <textarea 
                        name="address" 
                        placeholder="Enter full address details..." 
                        value={companyData.address || ''} 
                        onChange={handleChange} 
                        className="textarea textarea-bordered h-24 w-full" 
                        required 
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Other Information</span>
                    </label>
                    <textarea 
                        name="otherInformation" 
                        placeholder="Any additional notes or details..." 
                        value={companyData.otherInformation || ''} 
                        onChange={handleChange} 
                        className="textarea textarea-bordered h-24 w-full" 
                    />
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6 pt-4 border-t">
                <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Next <FiArrowRight className="ml-2"/>
                </button>
            </div>
        </form>
    );
};

export default Step1Company;