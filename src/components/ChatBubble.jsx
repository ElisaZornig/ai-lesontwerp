import React, { useEffect, useState } from 'react';

const ChatBubble = ({ message, fromUser }) => {
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        if (!fromUser) {
            setDisplayedMessage('');
            setTyping(true);

            // Eerst "..." animatie voor 600ms
            const dotsTimeout = setTimeout(() => {
                setTyping(false);

                let index = 0;
                const interval = setInterval(() => {
                    setDisplayedMessage(message.slice(0, index + 1));
                    index++;
                    if (index >= message.length) clearInterval(interval);
                }, 20); // snelheid van typewriter

                return () => clearInterval(interval);
            }, 600);

            return () => clearTimeout(dotsTimeout);
        } else {
            setDisplayedMessage(message); // gebruikersbericht direct tonen
        }
    }, [message, fromUser]);

    return (
        <div className={`flex ${fromUser ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`p-3 rounded-lg max-w-xs ${fromUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {fromUser ? message : typing ? '…' : displayedMessage}
            </div>
        </div>
    );
};

export default ChatBubble;
