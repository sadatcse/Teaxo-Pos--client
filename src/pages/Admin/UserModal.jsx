import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ImageUpload from '../../config/ImageUploadcpanel';

const UserModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialData = {}, isEditing, branches, assignableRoles }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const { password, ...data } = initialData;
        setFormData(data);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({ ...prev, photo: url }));
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
                <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" value={formData.name || ''} onChange={handleChange} className="input input-bordered w-full" required />
                    <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} className="input input-bordered w-full" required />
                    
                    {isEditing ? (
                        <input type="password" name="password" placeholder="New Password (leave blank to keep current)" onChange={handleChange} className="input input-bordered w-full" />
                    ) : (
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input input-bordered w-full" required />
                    )}

                    <select name="branch" value={formData.branch || ''} onChange={handleChange} className="select select-bordered w-full" required>
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>

                    <select name="role" value={formData.role || 'user'} onChange={handleChange} className="select select-bordered w-full" required>
                        <option value="">Select Role</option>
                        {assignableRoles.map(role => <option key={role} value={role} className="capitalize">{role}</option>)}
                    </select>

                    <select name="status" value={formData.status || 'active'} onChange={handleChange} className="select select-bordered w-full" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <ImageUpload setImageUrl={handleImageUpload} />

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;