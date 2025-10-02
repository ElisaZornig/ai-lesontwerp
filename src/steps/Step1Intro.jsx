import React, { useState, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';

const Step1Intro = ({ nextStep }) => {
    const [chat, setChat] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [showLoginQuestion, setShowLoginQuestion] = useState(false);
    const [showStep2Button, setShowStep2Button] = useState(false);

    const initialMessages = [
        "Hallo leerkrachten, vandaag leren jullie hoe je AI (zoals ChatGPT) kan gebruiken in het onderwijs.",
        "Er zijn veel manieren, maar vandaag gaan we leren hoe je een verhaaltjessom kan maken.",
        "We gaan dit stap voor stap doen, dus geen zorgen! Heb je er zin in?"
    ];

    const showMessageQueue = async (msgs) => {
        for (let i = 0; i < msgs.length; i++) {
            await new Promise(resolve => {
                setChat(prev => [...prev, { fromUser: false, message: msgs[i] }]);
                setTimeout(resolve, msgs[i].length * 20 + 600);
            });
        }
        setShowOptions(true);
    };

    useEffect(() => {
        showMessageQueue(initialMessages);
    }, []);

    const handleAnswer = async (answer) => {
        setChat(prev => [...prev, { fromUser: true, message: answer }]);
        setShowOptions(false);

        // Bepaal chatbot reactie
        let botReply = "Leuk! Laten we beginnen.";
        if (answer === "Ik weet het nog niet") botReply = "Geen probleem, we nemen het rustig door.";
        if (answer === "Klinkt spannend!") botReply = "Super! Zo gaan we stap voor stap verder.";
        if (answer === "Lijkt moeilijk") botReply = "Maak je geen zorgen, we doen het rustig aan.";

        await new Promise(resolve => {
            setChat(prev => [...prev, { fromUser: false, message: botReply }]);
            setTimeout(resolve, botReply.length * 20 + 600);
        });

        // Stuur login instructie
        setChat(prev => [...prev, { fromUser: false, message: "Om dit te doen moet je ingelogd zijn op ChatGPT zodat we de pro-versie kort kunnen gebruiken." }]);
        setShowLoginButton(true);
    };

    // Login knop klik
    const handleLoginClick = () => {
        // Optioneel delay voor realistisch effect
        setTimeout(() => {
            setChat(prev => [...prev, { fromUser: false, message: "Ben je ingelogd?" }]);
            setShowLoginQuestion(true);
        }, 1000);
        setShowLoginButton(false);
    };

    // Antwoord op loginvraag
    const handleLoginAnswer = (answer) => {
        setChat(prev => [...prev, { fromUser: true, message: answer }]);

        if (answer === "Ja") {
            setShowLoginQuestion(false);
            setChat(prev => [...prev, { fromUser: false, message: "Top! Je kunt nu doorgaan naar de volgende stap." }]);
            setShowStep2Button(true);
        } else {
            // Als ze Nee zeggen: vraag opnieuw
            setTimeout(() => {
                setChat(prev => [...prev, { fromUser: false, message: "Geen probleem! Ben je nu ingelogd?" }]);
                setShowLoginQuestion(true);
            }, 1000);
        }
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {chat.map((msg, i) => (
                    <ChatBubble key={i} fromUser={msg.fromUser} message={msg.message} />
                ))}
            </div>

            {showOptions && (
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleAnswer("Zin in")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Zin in</button>
                    <button onClick={() => handleAnswer("Ik weet het nog niet")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Ik weet het nog niet</button>
                    <button onClick={() => handleAnswer("Klinkt spannend!")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Klinkt spannend!</button>
                    <button onClick={() => handleAnswer("Lijkt moeilijk")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Lijkt moeilijk</button>
                </div>
            )}

            {showLoginButton && (
                <div className="mt-2">
                    <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mr-2">
                        Ga naar ChatGPT
                    </a>
                    <button onClick={handleLoginClick} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Ik ben klaar</button>
                </div>
            )}

            {showLoginQuestion && (
                <div className="flex gap-2 flex-wrap mt-2">
                    <button onClick={() => handleLoginAnswer("Ja")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Ja</button>
                    <button onClick={() => handleLoginAnswer("Nee")} className="bg-gray-200 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">Nee</button>
                </div>
            )}

            {showStep2Button && (
                <div className="mt-4">
                    <button onClick={() => nextStep({ step1Answer: "Voltooid" })} className="bg-green-500 text-white px-4 py-2 rounded">Ga naar Stap 2</button>
                </div>
            )}
        </div>
    );
};

export default Step1Intro;
