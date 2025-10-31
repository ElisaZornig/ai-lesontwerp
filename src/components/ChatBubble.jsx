import React, { useEffect, useRef, useState } from 'react';

const ChatBubble = ({
                        message = '',
                        fromUser = false,
                        typingDelay = 600,
                        typeSpeed = 18,
                        onDoneTyping = () => {},   // 👈 nieuw
                    }) => {
    const [displayed, setDisplayed] = useState(fromUser ? message : '');
    const [isTyping, setIsTyping] = useState(!fromUser && !!message);
    const doneCalledRef = useRef(false); // 👈 voorkomt dubbel aanroepen

    useEffect(() => {
        let timerDots;
        let interval;

        // reset "done" flag bij nieuw message
        doneCalledRef.current = false;

        if (!fromUser && message) {
            setDisplayed('');
            setIsTyping(true);

            timerDots = setTimeout(() => {
                setIsTyping(false);
                let i = 0;
                interval = setInterval(() => {
                    setDisplayed(message.slice(0, i + 1));
                    i++;
                    if (i >= message.length) {
                        clearInterval(interval);
                        // 👇 roep callback precies 1x aan
                        if (!doneCalledRef.current) {
                            doneCalledRef.current = true;
                            onDoneTyping();
                        }
                    }
                }, typeSpeed);
            }, typingDelay);
        } else {
            // user-bubble of lege bot: meteen tonen
            setDisplayed(message);
            setIsTyping(false);
            if (!doneCalledRef.current) {
                doneCalledRef.current = true;
                onDoneTyping(); // user-bericht "is meteen klaar"
            }
        }

        return () => {
            clearTimeout(timerDots);
            clearInterval(interval);
        };
    }, [message, fromUser, typingDelay, typeSpeed, onDoneTyping]);

    return (
        <div
            className={`max-w-[100%] px-4 py-3 rounded-2xl text-base leading-relaxed 
        ${fromUser
                ? 'self-end bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg'
                : 'self-start bg-white/80 text-gray-800 backdrop-blur-md shadow-sm border border-white/40'}`}
                style={{ whiteSpace: 'pre-wrap' }}   // 👈 dit laat \n zien als echte enters

        >
            {isTyping ? (
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
            ) : (
                displayed
            )}
        </div>
    );
};

export default ChatBubble;
