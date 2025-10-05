import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ chat }) => {
    const containerRef = useRef(null);
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when chat updates
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [chat]);

    return (
        <div className="flex flex-col-reverse flex-1 overflow-y-scroll p-6 bg-white/5">
            <div ref={containerRef} className="flex flex-col gap-4">
                {chat.map((m, idx) => (
                    <div key={idx} className={`${m.fromUser ? 'self-end' : 'self-start'} max-w-[80%]`}>
                        {/* ChatBubble handles inner styling + typing */}
                        {m.render}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ChatWindow;
