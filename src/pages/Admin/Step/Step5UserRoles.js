import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const Step5UserRoles = ({ data, onNext, onPrev }) => {
    const [roles, setRoles] = useState(data.roles.length > 0 ? data.roles : [{ roleName: '' }]);

    const handleAddRow = () => {
        setRoles([...roles, { roleName: '' }]);
    };

    const handleRemoveRow = (index) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    const handleChange = (index, e) => {
        const newRoles = [...roles];
        // Ensure role names are lowercase and have no spaces for consistency
        newRoles[index].roleName = e.target.value.toLowerCase().replace(/\s+/g, '');
        setRoles(newRoles);
    };

    const handleNext = () => {
        // Filter out any empty role names before proceeding
        const validRoles = roles.filter(role => role.roleName.trim() !== '');
        onNext({ roles: validRoles });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Define Custom User Roles</h2>
            <p className="text-sm text-gray-500 mb-4">Add custom roles for your branch, like 'cashier' or 'kitchen-staff'. Default roles 'Manager' and 'User' are always available.</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            name="roleName" 
                            placeholder="Role Name (e.g., cashier)" 
                            value={role.roleName} 
                            onChange={(e) => handleChange(index, e)} 
                            className="input input-bordered w-full" 
                        />
                        <button onClick={() => handleRemoveRow(index)} className="btn btn-ghost text-red-500"><FiTrash2/></button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddRow} className="btn btn-sm btn-ghost mt-2"><FiPlus/> Add Role</button>
            <div className="flex justify-between mt-6">
                <button type="button" onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button type="button" onClick={handleNext} className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </div>
    );
};

export default Step5UserRoles;