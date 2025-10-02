import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

const Step4Documents = ({ nextStep }) => {
    const [chat, setChat] = useState([
        { fromUser: false, message: "Je kunt nu een document toevoegen voor inspiratie. Voeg hier een link of beschrijving in." }
    ]);
    const [doc, setDoc] = useState('');

    const handleSubmit = () => {
        setChat([...chat, { fromUser: true, message: `Document toegevoegd: ${doc}` }]);
        setTimeout(() => nextStep({ step4Doc: doc }), 500);
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />)}
            </div>
            <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Document link of beschrijving" className="border p-2 rounded mb-2"/>
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Volgende</button>
        </div>
    );
};

export default Step4Documents;
