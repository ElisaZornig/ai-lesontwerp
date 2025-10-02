import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

const Step5Image = ({ nextStep }) => {
    const [chat, setChat] = useState([
        { fromUser: false, message: "Maak een AI-afbeelding voor je verhaaltjessom. Beschrijf wat je wilt zien." }
    ]);
    const [imagePrompt, setImagePrompt] = useState('');

    const handleSubmit = () => {
        setChat([...chat, { fromUser: true, message: `Afbeelding prompt: ${imagePrompt}` }]);
        setTimeout(() => nextStep({ step5Image: imagePrompt }), 500);
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />)}
            </div>
            <input value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Beschrijving afbeelding" className="border p-2 rounded mb-2"/>
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Volgende</button>
        </div>
    );
};

export default Step5Image;
