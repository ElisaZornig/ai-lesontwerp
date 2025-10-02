import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

const Step3Prompt = ({ nextStep, answers }) => {
    const [chat, setChat] = useState([
        { fromUser: false, message: `Laten we een verhaaltjessom maken voor groep ${answers.step2Info?.group} met leerdoel ${answers.step2Info?.goal}.` }
    ]);

    const themaOptions = ['Dieren', 'School', 'Vakantie', 'Eten'];
    const lengteOptions = ['Kort', 'Medium', 'Lang'];

    const [promptAnswer, setPromptAnswer] = useState('');
    const [theme, setTheme] = useState('');
    const [length, setLength] = useState('');

    const handleThemeSelect = (t) => setTheme(t);
    const handleLengthSelect = (l) => setLength(l);

    const handleSubmit = () => {
        setChat([...chat, { fromUser: true, message: `Som: ${promptAnswer}, Thema: ${theme}, Lengte: ${length}` }]);
        setTimeout(() => nextStep({ step3Prompt: { promptAnswer, theme, length } }), 500);
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />)}
            </div>

            <textarea value={promptAnswer} onChange={(e) => setPromptAnswer(e.target.value)} placeholder="AI antwoord" className="border p-2 rounded w-full mb-2"/>

            <div className="mb-2 flex gap-2 flex-wrap">
                {themaOptions.map(t => (
                    <button key={t} onClick={() => handleThemeSelect(t)}
                            className={`px-3 py-1 rounded-full ${theme === t ? 'bg-blue-500 text-white' : 'bg-gray-200'} transition`}>{t}</button>
                ))}
            </div>

            <div className="mb-2 flex gap-2 flex-wrap">
                {lengteOptions.map(l => (
                    <button key={l} onClick={() => handleLengthSelect(l)}
                            className={`px-3 py-1 rounded-full ${length === l ? 'bg-blue-500 text-white' : 'bg-gray-200'} transition`}>{l}</button>
                ))}
            </div>

            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Volgende</button>
        </div>
    );
};

export default Step3Prompt;
