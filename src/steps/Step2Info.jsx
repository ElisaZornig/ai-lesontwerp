// src/steps/Step2Info.jsx
import React, { useState, useEffect, useRef } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

const jaargroepen = ['1/2', '3/4', '5/6', '7/8'];
const rekendoelen = {
    '1/2': ['Getalbegrip', 'Optellen', 'Aftrekken', 'Meten'],
    '3/4': ['Keersommen', 'Deelsommen', 'Breuken', 'Tijd'],
    '5/6': ['Procenten', 'Kommagetallen', 'Meten', 'Breuken'],
    '7/8': ['Algebra', 'Meetkunde', 'Statistiek', 'Verhoudingen']
};

const Step2Info = ({ nextStep, answers = {} }) => {
    const [chat, setChat] = useState([]);
    const [showGroupOptions, setShowGroupOptions] = useState(false);
    const [showGoalOptions, setShowGoalOptions] = useState(false);
    const [awaitingName, setAwaitingName] = useState(false);
    const [showStep3Button, setShowStep3Button] = useState(false);

    const [group, setGroup] = useState(answers.step2Info?.group || '');
    const [goal, setGoal] = useState(answers.step2Info?.goal || '');
    const [name, setName] = useState(answers.step2Info?.name || '');

    // TypeBar control
    const [inputValue, setInputValue] = useState('');
    const [inputActive, setInputActive] = useState(false);

    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const msgs = [
            "Laten we wat info verzamelen zodat AI een passende som kan maken.",
            "Voor welke groep sta je?"
        ];

        const showQueue = async (messages) => {
            for (let i = 0; i < messages.length; i++) {
                await new Promise(resolve => {
                    setChat(prev => [
                        ...prev,
                        { fromUser: false, message: messages[i], render: <ChatBubble message={messages[i]} fromUser={false} /> }
                    ]);
                    setTimeout(resolve, messages[i].length * 20 + 600);
                });
            }
            setShowGroupOptions(true);
        };

        showQueue(msgs);
    }, []);

    const handleGroupSelect = (g) => {
        setGroup(g);
        const userMsg = `Ik sta in groep ${g}`;
        setChat(prev => [
            ...prev,
            { fromUser: true, message: userMsg, render: <ChatBubble message={userMsg} fromUser={true} /> }
        ]);

        setShowGroupOptions(false);
        setTimeout(() => {
            const botPrompt = 'Top! Kies nu een rekendoel:';
            setChat(prev => [
                ...prev,
                { fromUser: false, message: botPrompt, render: <ChatBubble message={botPrompt} fromUser={false} /> }
            ]);
            setShowGoalOptions(true);
        }, 600);
    };

    const handleGoalSelect = async (g) => {
        setGoal(g);
        const userMsg = `Ik kies rekendoel: ${g}`;
        setChat(prev => [
            ...prev,
            { fromUser: true, message: userMsg, render: <ChatBubble message={userMsg} fromUser={true} /> }
        ]);
        setShowGoalOptions(false);

        const msgs = [
            "Top, dankjewel!",
            `We gaan dus een verhaaltjessom maken voor groep ${group} met rekendoel ${g}.`,
            "Kun je ook je naam doorgeven?"
        ];

        for (let i = 0; i < msgs.length; i++) {
            await new Promise(resolve => {
                setChat(prev => [
                    ...prev,
                    { fromUser: false, message: msgs[i], render: <ChatBubble message={msgs[i]} fromUser={false} /> }
                ]);
                setTimeout(resolve, msgs[i].length * 20 + 600);
            });
        }

        setAwaitingName(true);
        setInputActive(true);
    };

    const submitName = async () => {
        const finalName = inputValue.trim();
        if (!finalName) return;

        setName(finalName);
        setChat(prev => [
            ...prev,
            { fromUser: true, message: `Mijn naam is ${finalName}`, render: <ChatBubble message={`Mijn naam is ${finalName}`} fromUser={true} /> }
        ]);
        setInputValue('');
        setInputActive(false);
        setAwaitingName(false);

        // bot reactie daarna
        await new Promise(resolve => {
            setTimeout(() => {
                const msg = "Top dankjewel, je kan nu door naar stap 3.";
                setChat(prev => [
                    ...prev,
                    { fromUser: false, message: msg, render: <ChatBubble message={msg} fromUser={false} /> }
                ]);
                resolve();
            }, 1000);
        });

        setShowStep3Button(true);
    };

    const typebarOptions = showGroupOptions
        ? jaargroepen
        : (showGoalOptions && group ? rekendoelen[group] : []);

    return (
        <AppWrapper progress={55}>
            <ChatWindow chat={chat} />

            {/* Step 3 button */}
            {showStep3Button && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => nextStep({ step2Info: { name, group, goal } })}
                        className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition"
                    >
                        Ga naar stap 3
                    </button>
                </div>
            )}

            <TypeBar
                options={typebarOptions}
                onSelect={(opt) => {
                    if (showGroupOptions && jaargroepen.includes(opt)) {
                        handleGroupSelect(opt);
                        return;
                    }
                    if (showGoalOptions && group && rekendoelen[group].includes(opt)) {
                        handleGoalSelect(opt);
                        return;
                    }
                }}
                inputValue={inputValue}
                onInputChange={setInputValue}
                inputActive={inputActive}
                onSubmitInput={submitName}
            />
        </AppWrapper>
    );
};

export default Step2Info;
