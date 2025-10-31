import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';
import AppWrapper from "../components/AppWrapper.jsx";

const Step1Intro = ({ nextStep }) => {
    const [chat, setChat] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [showLoginQuestion, setShowLoginQuestion] = useState(false);
    const [showStep2Button, setShowStep2Button] = useState(false);

    // input control for TypeBar
    const [inputValue, setInputValue] = useState('');
    const [inputActive, setInputActive] = useState(false);

    const initialMsgs = [
        'Hallo leerkrachten, vandaag leren jullie hoe je AI (zoals ChatGPT) kan gebruiken in het onderwijs.',
        'Er zijn veel manieren, maar vandaag gaan we leren hoe je een verhaaltjessom kan maken.',
        'We gaan dit stap voor stap doen, dus geen zorgen! Heb je er zin in?'
    ];

    // Toon de introductie-berichten na elkaar; activeer input pas na de laatste
    const showQueue = async (msgs) => {
        for (let i = 0; i < msgs.length; i++) {
            const isLast = i === msgs.length - 1;
            await new Promise((resolve) => {
                setChat((prev) => [
                    ...prev,
                    {
                        fromUser: false,
                        message: msgs[i],
                        render: (
                            <ChatBubble
                                message={msgs[i]}
                                fromUser={false}
                                onDoneTyping={() => {
                                    if (isLast) {
                                        setShowOptions(true);
                                        setInputActive(true);
                                    }
                                    resolve();
                                }}
                            />
                        )
                    }
                ]);
            });
        }
    };

    useEffect(() => {
        // start: input uit tot de intro klaar is
        setInputActive(false);
        showQueue(initialMsgs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pushUser = (text) => {
        setChat((prev) => [
            ...prev,
            { fromUser: true, message: text, render: <ChatBubble message={text} fromUser /> }
        ]);
    };

    const pushBot = (text, afterDone) => {
        setChat((prev) => [
            ...prev,
            {
                fromUser: false,
                message: text,
                render: <ChatBubble message={text} fromUser={false} onDoneTyping={afterDone || (() => {})} />
            }
        ]);
    };

    const handleAnswer = async (answer) => {
        // gebruiker kiest een optie/typt → input uit tijdens botreactie
        setInputActive(false);
        setShowOptions(false);
        pushUser(answer);

        // bepaal botreactie
        let botReply = 'Leuk! Laten we beginnen.';
        if (answer === 'Ik weet het nog niet') botReply = 'Geen probleem, we nemen het rustig door.';
        if (answer === 'Klinkt spannend!') botReply = 'Super! Zo gaan we stap voor stap verder.';
        if (answer === 'Lijkt moeilijk') botReply = 'Maak je geen zorgen, we doen het rustig aan.';

        // 1) korte reactie
        pushBot(botReply, () => {
            // 2) login-instructie
            pushBot(
                'Om dit te doen moet je ingelogd zijn op ChatGPT zodat we de pro-versie kort kunnen gebruiken.',
                () => {
                    setShowLoginButton(true);
                    setInputActive(true); // nu mag er weer gekozen/getypt worden
                }
            );
        });
    };

    const handleLoginClick = () => {
        setShowLoginButton(false);
        setInputActive(false); // uit tijdens botvraag
        pushBot('Ben je ingelogd?', () => {
            setShowLoginQuestion(true);
            setInputActive(true);
        });
    };

    const handleLoginAnswer = (answer) => {
        setInputActive(false);
        setShowLoginQuestion(false);
        pushUser(answer);

        if (answer === 'Ja') {
            pushBot('Top! Je kunt nu doorgaan naar de volgende stap.', () => {
                setShowStep2Button(true);
                setInputActive(true);
            });
        } else {
            pushBot('Geen probleem! Ben je nu ingelogd?', () => {
                setShowLoginQuestion(true);
                setInputActive(true);
            });
        }
    };

    // TypeBar handlers (als je vrij typen toestaat)
    const onSelectOption = (opt) => handleAnswer(opt);
    const onInputSubmit = () => {
        if (!inputValue.trim()) return;
        handleAnswer(inputValue.trim());
        setInputValue('');
    };

    return (
        <AppWrapper progress={15}>
            <ChatWindow chat={chat} />

            <TypeBar
                options={
                    showStep2Button
                        ? ['Ga naar Stap 2']
                        : showOptions
                            ? ['Zin in', 'Ik weet het nog niet', 'Klinkt spannend!', 'Lijkt moeilijk']
                            : showLoginButton
                                ? ['Ga naar ChatGPT', 'Ik ben klaar']
                                : showLoginQuestion
                                    ? ['Ja', 'Nee']
                                    : []
                }
                onSelect={(opt) => {
                    if (opt === 'Ga naar ChatGPT') {
                        window.open('https://chat.openai.com', '_blank', 'noopener,noreferrer');
                    } else if (opt === 'Ik ben klaar') {
                        handleLoginClick();
                    } else if (opt === 'Ja' || opt === 'Nee') {
                        handleLoginAnswer(opt);
                    } else if (opt === 'Ga naar Stap 2') {
                        nextStep({ step1Answer: 'Voltooid' });
                    } else {
                        onSelectOption(opt);
                    }
                }}
                inputValue={inputValue}
                onInputChange={setInputValue}
                inputActive={inputActive}
                onSubmitInput={onInputSubmit}
            />
        </AppWrapper>
    );
};

export default Step1Intro;
