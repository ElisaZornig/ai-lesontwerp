
import React, { useState, useEffect } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

const Step1Intro = ({ nextStep }) => {
    const [chat, setChat] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [showLoginQuestion, setShowLoginQuestion] = useState(false);
    const [showStep2Button, setShowStep2Button] = useState(false);

    // input control for typebar
    const [inputValue, setInputValue] = useState('');
    const [inputActive, setInputActive] = useState(false);

    const initialMsgs = [
        "Hallo leerkrachten, vandaag leren jullie hoe je AI (zoals ChatGPT) kan gebruiken in het onderwijs.",
        "Er zijn veel manieren, maar vandaag gaan we leren hoe je een verhaaltjessom kan maken.",
        "We gaan dit stap voor stap doen, dus geen zorgen! Heb je er zin in?"
    ];

    const showQueue = async (msgs) => {
        for (let i = 0; i < msgs.length; i++) {
            await new Promise(resolve => {
                // push a rendered ChatBubble so typing effect happens inside
                setChat(prev => [...prev, { fromUser: false, message: msgs[i], render: <ChatBubble message={msgs[i]} fromUser={false} /> }]);
                setTimeout(resolve, msgs[i].length * 20 + 600);
            });
        }
        setShowOptions(true);
    };

    useEffect(() => { showQueue(initialMsgs); }, []);

    const handleAnswer = async (answer) => {
        // push user's bubble
        setChat(prev => [...prev, { fromUser: true, message: answer, render: <ChatBubble message={answer} fromUser={true} /> }]);
        setShowOptions(false);

        // bot reply
        let botReply = "Leuk! Laten we beginnen.";
        if (answer === "Ik weet het nog niet") botReply = "Geen probleem, we nemen het rustig door.";
        if (answer === "Klinkt spannend!") botReply = "Super! Zo gaan we stap voor stap verder.";
        if (answer === "Lijkt moeilijk") botReply = "Maak je geen zorgen, we doen het rustig aan.";

        // push bot bubble (it will type)
        setChat(prev => [...prev, { fromUser: false, message: botReply, render: <ChatBubble message={botReply} fromUser={false} /> }]);

        // after bot types, show login instruction and button
        setTimeout(() => {
            setChat(prev => [...prev, { fromUser: false, message: "Om dit te doen moet je ingelogd zijn op ChatGPT zodat we de pro-versie kort kunnen gebruiken.", render: <ChatBubble message={"Om dit te doen moet je ingelogd zijn op ChatGPT zodat we de pro-versie kort kunnen gebruiken."} fromUser={false} /> }]);
            setShowLoginButton(true);
        }, botReply.length * 20 + 700);
    };

    const handleLoginClick = () => {
        setShowLoginButton(false);
        setTimeout(() => {
            setChat(prev => [...prev, { fromUser: false, message: "Ben je ingelogd?", render: <ChatBubble message={"Ben je ingelogd?"} fromUser={false} /> }]);
            setShowLoginQuestion(true);
        }, 800);
    };

    const handleLoginAnswer = (answer) => {
        setChat(prev => [...prev, { fromUser: true, message: answer, render: <ChatBubble message={answer} fromUser={true} /> }]);
        setShowLoginQuestion(false);

        if (answer === "Ja") {
            setChat(prev => [...prev, { fromUser: false, message: "Top! Je kunt nu doorgaan naar de volgende stap.", render: <ChatBubble message={"Top! Je kunt nu doorgaan naar de volgende stap."} fromUser={false} /> }]);
            setShowStep2Button(true);
        } else {
            setTimeout(() => {
                setChat(prev => [...prev, { fromUser: false, message: "Geen probleem! Ben je nu ingelogd?", render: <ChatBubble message={"Geen probleem! Ben je nu ingelogd?"} fromUser={false} /> }]);
                setShowLoginQuestion(true);
            }, 900);
        }
    };

    // TypeBar handlers (for when typing is enabled)
    const onSelectOption = (opt) => { handleAnswer(opt); };
    const onInputSubmit = () => {
        if (!inputValue.trim()) return;
        // push user message and process as needed — example: send to handleAnswer
        handleAnswer(inputValue.trim());
        setInputValue('');
    };

    return (
        <AppWrapper progress={15}>
            {/* ChatWindow consumes chat array which contains .render elements */}
            <ChatWindow chat={chat} />

            {/* bottom TypeBar (options or input) */}
            <TypeBar
                options={ showStep2Button
                    ? ["Ga naar Stap 2"] : showOptions ? ["Zin in", "Ik weet het nog niet", "Klinkt spannend!", "Lijkt moeilijk"] : (showLoginButton ? ["Ga naar ChatGPT", "Ik ben klaar"] : (showLoginQuestion ? ["Ja","Nee"] : [])) }
                onSelect={(opt) => {
                    if (opt === "Ga naar ChatGPT") {
                        window.open("https://chat.openai.com", "_blank");
                    } else if (opt === "Ik ben klaar") {
                        handleLoginClick();
                    } else if (opt === "Ja" || opt === "Nee") {
                        handleLoginAnswer(opt);
                    } else if (opt === "Ga naar Stap 2") {
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
