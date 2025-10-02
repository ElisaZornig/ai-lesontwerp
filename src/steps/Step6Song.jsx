import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

const Step6Song = ({ nextStep }) => {
    const [chat, setChat] = useState([
        { fromUser: false, message: "Nu maken we een liedje rond de verhaaltjessom." }
    ]);
    const [song, setSong] = useState('');

    const handleSubmit = () => {
        setChat([...chat, { fromUser: true, message: `Liedje: ${song}` }]);
        setTimeout(() => nextStep({ step6Song: song }), 500);
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />)}
            </div>
            <textarea value={song} onChange={(e) => setSong(e.target.value)} placeholder="Je liedje" className="border p-2 rounded w-full mb-2"/>
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Volgende</button>
        </div>
    );
};

export default Step6Song;
