import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

const Step1Company = ({ data, onNext }) => {
    const [companyData, setCompanyData] = useState(data.company);

    const handleChange = (e) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={() => onNext({ company: companyData })} className="space-y-4">
            <h2 className="text-xl font-semibold">Branch Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Company Name" value={companyData.name || ''} onChange={handleChange} className="input input-bordered w-full" required />
                <input type="text" name="branch" placeholder="Branch Name (e.g., teaxo)" value={companyData.branch || ''} onChange={handleChange} className="input input-bordered w-full" required />
                <input type="email" name="email" placeholder="Branch Email" value={companyData.email || ''} onChange={handleChange} className="input input-bordered w-full" required />
                <input type="text" name="phone" placeholder="Branch Phone" value={companyData.phone || ''} onChange={handleChange} className="input input-bordered w-full" required />
            </div>
            <textarea name="address" placeholder="Branch Address" value={companyData.address || ''} onChange={handleChange} className="textarea textarea-bordered w-full" required />
            <div className="flex justify-end">
                <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </form>
    );
};

export default Step1Company;