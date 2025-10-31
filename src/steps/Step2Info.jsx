// src/steps/Step2Info.jsx
import React, { useEffect, useRef, useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

const jaargroepen = ['1/2', '3/4', '5/6', '7/8'];
const rekendoelen = {
    '1/2': ['Getalbegrip', 'Optellen', 'Aftrekken', 'Meten'],
    '3/4': ['Keersommen', 'Deelsommen', 'Breuken', 'Tijd'],
    '5/6': ['Procenten', 'Kommagetallen', 'Meten', 'Breuken'],
    '7/8': ['Algebra', 'Meetkunde', 'Statistiek', 'Verhoudingen'],
};

const Step2Info = ({ nextStep, answers = {} }) => {
    const [chat, setChat] = useState([]);
    const [showGroupOptions, setShowGroupOptions] = useState(false);
    const [showGoalOptions, setShowGoalOptions] = useState(false);
    const [awaitingName, setAwaitingName] = useState(false);

    // 👇 Nieuw: we tonen “Ga naar Stap 3” als TypeBar-optie (zoals in Stap 1)
    const [showStep3Option, setShowStep3Option] = useState(false);

    const [group, setGroup] = useState(answers.step2Info?.group || '');
    const [goal, setGoal] = useState(answers.step2Info?.goal || '');
    const [name, setName] = useState(answers.step2Info?.name || '');

    const [inputValue, setInputValue] = useState('');
    const [inputActive, setInputActive] = useState(false);

    const ranRef = useRef(false);

    const pushUser = (text) =>
        setChat((prev) => [
            ...prev,
            { fromUser: true, message: text, render: <ChatBubble message={text} fromUser /> },
        ]);

    // Promise-gebaseerde bot push: resolve pas na uittypen
    const pushBotAsync = (text) =>
        new Promise((resolve) => {
            setChat((prev) => [
                ...prev,
                {
                    fromUser: false,
                    message: text,
                    render: <ChatBubble message={text} fromUser={false} onDoneTyping={resolve} />,
                },
            ]);
        });

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        (async () => {
            setInputActive(false);
            await pushBotAsync('Laten we wat info verzamelen zodat AI een passende som kan maken.');
            await pushBotAsync('Voor welke groep sta je?');
            setShowGroupOptions(true);
            setInputActive(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGroupSelect = async (g) => {
        setInputActive(false);
        setShowGroupOptions(false);
        setGroup(g);
        pushUser(`Ik sta in groep ${g}`);

        await pushBotAsync('Top! Kies nu een rekendoel:');

        setShowGoalOptions(true);
        setInputActive(true);
    };

    const handleGoalSelect = async (g) => {
        setInputActive(false);
        setShowGoalOptions(false);
        setGoal(g);
        pushUser(`Ik kies rekendoel: ${g}`);

        await pushBotAsync('Top, dankjewel!');
        await pushBotAsync(`We gaan dus een verhaaltjessom maken voor groep ${group || '?'} met rekendoel ${g}.`);
        await pushBotAsync('Kun je ook je naam doorgeven?');

        setAwaitingName(true);
        setInputActive(true);
    };

    const submitName = async () => {
        const finalName = inputValue.trim();
        if (!finalName) return;

        setName(finalName);
        setInputValue('');
        setInputActive(false);
        setAwaitingName(false);

        pushUser(`Mijn naam is ${finalName}`);

        await pushBotAsync('Top dankjewel, je kan nu door naar stap 3.');

        // 🎯 Toon de TypeBar-optie “Ga naar Stap 3” (zoals in Stap 1)
        setShowStep3Option(true);
        setInputActive(true);
    };

    // 🔧 Bepaal de TypeBar-opties in dezelfde stijl als Stap 1
    let typebarOptions = [];
    if (showStep3Option) {
        typebarOptions = ['Ga naar Stap 3']; // let op: zelfde hoofdlettergebruik als in Stap 1
    } else if (showGroupOptions) {
        typebarOptions = jaargroepen;
    } else if (showGoalOptions && group) {
        typebarOptions = rekendoelen[group];
    }

    const canGoNext = Boolean(name && group && goal);

    return (
        <AppWrapper progress={55}>
            <div className="flex flex-col h-full">
                <ChatWindow chat={chat} />

                <TypeBar
                    options={typebarOptions}
                    onSelect={(opt) => {
                        if (opt === 'Ga naar Stap 3') {
                            if (canGoNext) nextStep({ step2Info: { name, group, goal } });
                            return;
                        }
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
                    // Alleen tijdens naam-invoer wil je vrij kunnen typen
                    inputActive={inputActive && awaitingName && !showStep3Option}
                    onSubmitInput={submitName}
                />
            </div>
        </AppWrapper>
    );
};

export default Step2Info;
