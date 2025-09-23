import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const Step4Tables = ({ data, onNext, onPrev }) => {
    const [tableCount, setTableCount] = useState(data.tables.length || 5);

    const handleNext = () => {
        const tables = Array.from({ length: tableCount }, (_, i) => ({
            tableName: `T-${i + 1}`
        }));
        onNext({ tables });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Setup Dining Tables</h2>
            <div className="form-control w-full max-w-xs">
                <label className="label"><span className="label-text">How many tables does this branch have?</span></label>
                <input type="number" value={tableCount} onChange={(e) => setTableCount(parseInt(e.target.value, 10))} className="input input-bordered" />
            </div>
            <div className="flex justify-between mt-6">
                <button onClick={onPrev} className="btn btn-ghost"><FiArrowLeft/> Previous</button>
                <button onClick={handleNext} className="btn bg-blue-600 hover:bg-blue-700 text-white">Next <FiArrowRight/></button>
            </div>
        </div>
    );
};

export default Step4Tables;