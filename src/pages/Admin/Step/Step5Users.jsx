import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const Step5Users = ({ data, onNext, onPrev }) => {
    const [users, setUsers] = useState(data.users.length > 0 ? data.users : [{ name: '', email: '', password: '', role: 'manager' }]);

    const handleAddRow = () => setUsers([...users, { name: '', email: '', password: '', role: 'user' }]);
    const handleRemoveRow = (index) => setUsers(users.filter((_, i) => i !== index));
    const handleChange = (index, e) => {
        const newUsers = [...users];
        newUsers[index][e.target.name] = e.target.value;
        setUsers(newUsers);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Create Initial Users</h2>
            <p className="text-sm text-gray-500 mb-4">Create at least one Manager for the new branch.</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <input type="text" name="name" placeholder="Full Name" value={user.name} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full" />
                        <input type="email" name="email" placeholder="Email" value={user.email} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full" />
                        <input type="password" name="password" placeholder="Password" value={user.password} onChange={(e) => handleChange(index, e)} className="input input-bordered w-full" />
                        <div className="flex items-center gap-2">
                            <select name="role" value={user.role} onChange={(e) => handleChange(index, e)} className="select select-bordered w-full">
                                <option value="manager">Manager</option>
                                <option value="user">User</option>
                            </select>
                            <button onClick={() => handleRemoveRow(index)} className="btn btn-ghost text-red-500"><FiTrash2/></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleAddRow} className="btn btn-sm btn-ghost mt-2"><FiPlus/> Add User</button>
            <div className="flex justify-between mt-6">
                <button onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button onClick={() => onNext({ users })} className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </div>
    );
};

export default Step5Users;