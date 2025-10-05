import React from 'react';

/**
 * TypeBar props:
 * - options: array of strings for option buttons
 * - onSelect(option)
 * - inputValue, onInputChange
 * - inputActive (bool) => when true input enabled; when false input disabled
 */
const TypeBar = ({ options = [], onSelect = () => {}, inputValue = '', onInputChange = () => {}, inputActive = false, onSubmitInput = () => {} }) => {
    return (
        <div className="p-4 bg-white/6 border-t border-white/10">
            <div className="max-w-full flex flex-col gap-3">
                {/* options row */}
                {options && options.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect(opt)}
                                className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-500 hover:text-white transition"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="flex items-center gap-3">
                    <input
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        disabled={!inputActive}
                        placeholder={inputActive ? 'Typ hier je antwoord...' : ''}
                        className={`flex-1 p-3 rounded-lg ${inputActive ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && inputActive) onSubmitInput();
                        }}
                    />
                    <button
                        onClick={() => inputActive && onSubmitInput()}
                        className={`px-4 py-2 rounded-lg ${inputActive ? 'bg-indigo-600 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        Verstuur
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TypeBar;
