import React from 'react';

const ProgressBar = ({ step, totalSteps }) => {
    const progress = (step / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
            <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default ProgressBar;
