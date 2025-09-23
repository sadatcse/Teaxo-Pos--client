import React from 'react';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const Step6Review = ({ data, onPrev, onSubmit, isSubmitting }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
            <div className="space-y-4 text-sm">
                <div><strong>Branch Name:</strong> {data.company.name} ({data.company.branch})</div>
                <div><strong>Categories to create:</strong> {data.categories.length}</div>
                <div><strong>Products to create:</strong> {data.products.length}</div>
                <div><strong>Tables to create:</strong> {data.tables.length}</div>
                <div><strong>Users to create:</strong> {data.users.length}</div>
            </div>
             <div className="alert alert-warning mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Please review all information. This action cannot be undone.</span>
            </div>
            <div className="flex justify-between mt-6">
                <button onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button onClick={onSubmit} className="btn bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading loading-spinner"></span> : <><FiCheckCircle/> Create Branch</>}
                </button>
            </div>
        </div>
    );
};

export default Step6Review;