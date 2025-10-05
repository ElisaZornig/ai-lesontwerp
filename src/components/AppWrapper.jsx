import React from 'react';

const AppWrapper = ({ children, progress = 10 }) => {
  return (
      <div className="hidden lg:flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-900 p-8">
        <div className="w-full max-w-7xl h-[90vh] flex items-center justify-center">
          <div className="w-full h-full flex flex-col rounded-[2rem] shadow-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">

            {/* progressbar */}
            <div className="h-2 w-full bg-white/10">
              <div
                  className="h-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
              />
            </div>

            {/* chat area */}
            <div className="flex-1 flex flex-col h-[90vh]">
              {children}
            </div>
          </div>
        </div>
      </div>
  );
};

export default AppWrapper;
