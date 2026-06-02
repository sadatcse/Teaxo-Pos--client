import React from 'react';
import Mtitle from '../../components library/Mtitle';
import { FiClipboard } from 'react-icons/fi';

const Worklog = () => {
    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-955 min-h-screen transition-colors duration-300">
            <Mtitle title="Work Logs" />
            
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-slate-400 dark:text-slate-500 mt-6 transition-colors">
                <FiClipboard className="mx-auto text-4xl mb-3 opacity-60" />
                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">No logs generated yet</p>
                <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Employee work and shift duration logs will appear here.</p>
            </div>
        </div>
    );
};

export default Worklog;