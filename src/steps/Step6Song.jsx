// Step6Song.jsx — zelfde structuur als stap 3/4/5 (chat[] + pushBotAsync + TypeBar + expliciete CTA)
import React, { useEffect, useRef, useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

export default function Step6Song({ nextStep, answers = {} }) {
    // Basisdata voor context
    const info = answers?.step2Info || {};
    const s3   = answers?.step3Prompt || {};
    const s4   = answers?.step4Doc    || {};
    const group = info?.group || '[groep]';
    const goal  = info?.goal  || '[leerdoel]';

    // Chat & input-state
    const [chat, setChat] = useState([]);
    const [inputActive, setInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Stages:
    // 0=intro, 1=suno-link + pauze, 2=gelukt?, 3=wil je een link toevoegen?, 31=link invoeren, 4=CTA
    const [stage, setStage] = useState(0);

    // Buffer: we sturen pas echt door bij CTA
    const pendingPayloadRef = useRef(null);

    // Helpers (zoals in voorgaande stappen)
    const pushUser = (text) =>
        setChat((c) => [
            ...c,
            { fromUser: true, message: text, render: <ChatBubble message={text} fromUser /> },
        ]);

    const pushBotAsync = (text) =>
        new Promise((resolve) => {
            setChat((c) => [
                ...c,
                { fromUser: false, message: text, render: <ChatBubble message={text} onDoneTyping={resolve} /> },
            ]);
        });

    // Voorbeeldprompts op basis van de verhaaltjessom
    const buildSongPrompts = () => {
        const somKort = s4?.finalStory ? s4.finalStory.slice(0, 200) + (s4.finalStory.length > 200 ? '…' : '') : 'een korte verhaaltjessom over een herkenbare schoolsituatie';
        const theme  = s3?.chosenTheme || 'schooldag';
        return [
            // 1. Kinderpop
            `Kinderpop, vrolijk tempo, 20–30 seconden. Maak een kort liedje over: ${somKort}. Gebruik simpele woorden die leerlingen uit groep ${group} begrijpen. Geen antwoord van de som verklappen.`,
            // 2. Akoestische jingle
            `Akoestische jingle met gitaar en handklap, 15–25 seconden. Thema: ${theme}. Refrein 1 regel, couplet 2 regels. Geen som-uitwerking in de tekst.`,
            // 3. Instrumentaal (veilig voor klas)
            `Instrumentaal, opgewekt en speels. 20–30 seconden. Past bij een rekenactiviteit in de klas. Geen zang.`
        ];
    };

    const songPrompts = buildSongPrompts();

    // Startflow
    useEffect(() => {
        (async () => {
            setInputActive(false);

            // Intro
            await pushBotAsync('Als leuke afsluiter: AI kan ook muziek maken. We gaan een kort nummer proberen dat past bij je verhaaltjessom.');

            // Prompt-uitleg
            await pushBotAsync('Je gebruikt dezelfde prompt-principes: duidelijk doel, toon en lengte. Bedenk dus vooraf: genre, tempo, stijl, wel of geen zang, en vooral: verklap het antwoord van de som niet.');

            // Link + tips
            await pushBotAsync('Open suno.com. Maak daar een korte song op basis van jouw som of thema. Hieronder staan drie voorbeeldprompts die je kunt kopiëren of aanpassen.');
            for (const p of songPrompts) {
                // elke prompt als aparte bubble
                // eslint-disable-next-line no-await-in-loop
                await pushBotAsync(`Voorbeeldprompt: ${p}`);
            }

            // Pauze: opties in de TypeBar
            setStage(1);
            setInputActive(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Opties per stage
    let options = [];
    if (stage === 1) options = ['Open Suno', 'Ik heb een song gemaakt', 'Suno lukt niet (overslaan)'];
    else if (stage === 2) options = ['Ja', 'Nee'];                // gelukt?
    else if (stage === 3) options = ['Ja, link toevoegen', 'Nee, overslaan'];
    else if (stage === 4) options = ['Ga naar Stap 7'];           // CTA

    // Klik op opties
    const handleSelect = async (opt) => {
        // STAGE 1 — link/pauze of overslaan
        if (stage === 1) {
            if (opt === 'Open Suno') {
                window.open('https://suno.com', '_blank', 'noopener,noreferrer');
                return; // blijf in stage 1 tot ze klaar zijn
            }
            if (opt === 'Suno lukt niet (overslaan)') {
                pushUser(opt);
                await pushBotAsync('Geen probleem. Dit is een optionele stap om mogelijkheden te laten zien. Je kunt direct door naar de volgende stap.');
                pendingPayloadRef.current = { step6Song: { skipped: true } };
                setStage(4);
                setInputActive(true);
                return;
            }
            if (opt === 'Ik heb een song gemaakt') {
                setInputActive(false);
                pushUser(opt);

                await pushBotAsync('Mooi. Is het gelukt om een song te genereren die past bij je som zonder het antwoord te verklappen?');
                setStage(2);
                setInputActive(true);
            }
            return;
        }

        // STAGE 2 — gelukt?
        if (stage === 2) {
            setInputActive(false);
            pushUser(opt);

            if (opt === 'Ja') {
                await pushBotAsync('Wil je de link naar je song toevoegen aan de export?');
                setStage(3);
                setInputActive(true);
            } else {
                await pushBotAsync('Geen zorgen. Je kunt deze stap overslaan en later alsnog een link toevoegen.');
                pendingPayloadRef.current = { step6Song: { skipped: true } };
                setStage(4);
                setInputActive(true);
            }
            return;
        }

        // STAGE 3 — link toevoegen?
        if (stage === 3) {
            setInputActive(false);
            pushUser(opt);

            if (opt === 'Ja, link toevoegen') {
                await pushBotAsync('Plak hieronder de deel-link van je song (bijvoorbeeld van Suno).');
                setStage(31);
                setInputActive(true); // vrije tekst invoer
            } else {
                await pushBotAsync('Prima. We slaan deze stap over. Je kunt later nog toevoegen als je wilt.');
                pendingPayloadRef.current = { step6Song: { skipped: true } };
                setStage(4);
                setInputActive(true);
            }
            return;
        }

        // STAGE 4 — CTA
        if (stage === 4 && opt === 'Ga naar Stap 7') {
            const payload = pendingPayloadRef.current || {};
            nextStep(payload, 7);
        }
    };

    // Vrije tekst alleen bij stage 31 (link invoeren)
    const handleSubmit = async () => {
        const text = (inputValue || '').trim();
        if (!inputActive || !text) return;

        if (stage === 31) {
            setInputActive(false);
            pushUser(text);
            setInputValue('');

            // Buffer opslaan; pas bij CTA door
            pendingPayloadRef.current = {
                step6Song: {
                    link: text,
                    meta: { group, goal }
                }
            };

            await pushBotAsync('Dank je. De link is opgeslagen voor de export.');
            await pushBotAsync('Klik hieronder op Ga naar Stap 7 om af te ronden en te exporteren.');
            setStage(4);
            setInputActive(true);
        }
    };

    return (
        <AppWrapper progress={92}>
            <div className="flex flex-col h-full">
                <ChatWindow chat={chat} />

                <div className="border-t border-white/10">
                    <TypeBar
                        options={options}
                        onSelect={handleSelect}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        inputActive={inputActive && stage === 31}
                        onSubmitInput={handleSubmit}
                    />
                </div>
            </div>
        </AppWrapper>
    );
}
