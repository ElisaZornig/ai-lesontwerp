import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

const jaargroepen = ['1/2', '3/4', '5/6', '7/8'];
const rekendoelen = {
    '1/2': ['Getalbegrip', 'Optellen', 'Aftrekken', 'Meten'],
    '3/4': ['Keersommen', 'Deelsommen', 'Breuken', 'Tijd'],
    '5/6': ['Procenten', 'Kommagetallen', 'Meten', 'Breuken'],
    '7/8': ['Algebra', 'Meetkunde', 'Statistiek', 'Verhoudingen']
};

const Step2Info = ({ nextStep }) => {
    const [chat, setChat] = useState([
        { fromUser: false, message: "Laten we wat info verzamelen zodat AI een passende som kan maken." }
    ]);

    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [goal, setGoal] = useState('');
    const [email, setEmail] = useState('');

    const handleGroupSelect = (g) => {
        setGroup(g);
        setChat([...chat, { fromUser: true, message: `Ik sta in groep ${g}` }]);
        setTimeout(() => setChat(prev => [...prev, { fromUser: false, message: `Top! Kies nu een rekendoel:` }]), 500);
    };

    const handleGoalSelect = (g) => {
        setGoal(g);
        setChat([...chat, { fromUser: true, message: `Ik kies rekendoel: ${g}` }]);
    };

    const handleSubmit = () => {
        setChat([...chat, { fromUser: true, message: `Naam: ${name}, E-mail: ${email}` }]);
        setTimeout(() => nextStep({ step2Info: { name, group, goal, email } }), 500);
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />)}
            </div>

            {!group && (
                <div className="flex gap-2 flex-wrap mb-2">
                    {jaargroepen.map((g) => (
                        <button key={g} onClick={() => handleGroupSelect(g)}
                                className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">
                            {g}
                        </button>
                    ))}
                </div>
            )}

            {group && !goal && (
                <div className="flex gap-2 flex-wrap mb-2">
                    {rekendoelen[group].map((g) => (
                        <button key={g} onClick={() => handleGoalSelect(g)}
                                className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">
                            {g}
                        </button>
                    ))}
                </div>
            )}

            {group && goal && (
                <div className="flex flex-col gap-2 mt-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" className="border p-2 rounded"/>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="border p-2 rounded"/>
                    <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Volgende</button>
                </div>
            )}
        </div>
    );
};

export default Step2Info;
