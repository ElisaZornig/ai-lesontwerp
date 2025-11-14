// Step4Documents.jsx — toont de definitieve prompt uit stap 3 en gebruikt die bij de document-instructie
import React, { useEffect, useRef, useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

export default function Step4Documents({ nextStep, answers = {} }) {
    // Data uit eerdere stappen
    const info = answers?.step2Info || {};
    const s3   = answers?.step3Prompt || {};
    const group = info?.group || 'groep 3/4';
    const goal  = info?.goal  || 'Keersommen';

    // Chat/timeline en invoer
    const [chat, setChat] = useState([]);
    const [inputActive, setInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Stages: 0=intro, 1=download-pauze, 2=gelukt?, 3=tevreden?, 4=definitieve som invoer, 5=CTA
    const [stage, setStage] = useState(0);

    // Buffer: definitieve payload pas sturen bij klik op "Ga naar Stap 5"
    const pendingPayloadRef = useRef(null);

    // Helpers (zelfde ruggengraat als stap 3)
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

    // Definitieve instructie:
    // 1) primair: exact de finalPrompt uit stap 3
    // 2) fallback: jouw vaste tekst met variabelen/thema/keuzes of defaults
    // Definitieve instructie:
// 1) primair: finalPrompt uit stap 3, met een duidelijke doc-regel als die nog ontbreekt
// 2) fallback: vaste tekst inclusief "als voorbeeld" + context
    const buildInstructions = () => {
        const fp = (answers?.step3Prompt?.finalPrompt || '').trim();

        if (fp) {
            // Als de finalPrompt nog niets zegt over document/context, voeg het expliciet toe.
            const saysDoc = /document|werkblad|contextbron|context/.test(fp.toLowerCase());
            const docLine = 'Gebruik het geüploade document als voorbeeld en context (upload of plak voorbeelden in je AI). ';
            return saysDoc ? fp : docLine + fp;
        }

        // Fallback op basis van stap 2/3 (of defaults)
        const info = answers?.step2Info || {};
        const s3   = answers?.step3Prompt || {};
        const group = info?.group || 'groep 3/4';
        const goal  = info?.goal  || 'Keersommen';
        const theme = s3?.chosenTheme || 'jouw gekozen thema';
        const length = (s3?.lengthChoice || 'kort').toLowerCase();
        const tone   = (s3?.toneChoice   || 'vriendelijk en duidelijk').toLowerCase();

        return [
            'Gebruik het gedownloade werkblad als contextbron en als voorbeeld (upload of plak voorbeelden in je AI).',
            `Maak één verhaaltjessom voor ${group}, leerdoel: ${goal}.`,
            `Thema: "${theme}".`,
            `Lengte: ${length}.`,
            `Toon: ${tone}.`,
            'Eisen: 1) één duidelijk verhaal met één centrale vraag, 2) juiste bewerking, 3) géén antwoord geven, 4) sluit af met een korte controlezin: wat wordt gevraagd en welke bewerking past.'
        ].join(' ');
    };
    const instructions = buildInstructions();

    // Startflow
    useEffect(() => {
        (async () => {
            setInputActive(false);

            // Zin 1 — intro
            await pushBotAsync(
                'Om ChatGPT nog meer context te geven—en je som dus beter te maken—kun je ook documenten als voorbeeld invoeren.'
            );

            // Zin 2 — link met groep/leerdoel
            await pushBotAsync(
                `Zodat je niet het hele internet hoeft af te speuren: hier kun je snel een werkblad downloaden voor ${group} en leerdoel ${goal}.`
            );

            // Pauze: eerst downloaden en bevestigen
            setStage(1);
            setInputActive(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Opties per stage
    let options = [];
    if (stage === 1) options = ['Download werkblad', "Ik heb ’m gedownload"];
    else if (stage === 2) options = ['Ja', 'Nee'];            // Gelukt?
    else if (stage === 3) options = ['Ja', 'Nee'];            // Tevreden?
    else if (stage === 5) options = ['Ga naar Stap 5'];       // CTA

    // Klik op opties
    const handleSelect = async (opt) => {
        // STAGE 1 — download
        if (stage === 1) {
            if (opt === 'Download werkblad') {
                window.open('https://www.redactiesommen.nl/werkbladmaken.php', '_blank', 'noopener,noreferrer');
                return; // blijf in stage 1
            }
            if (opt === "Ik heb ’m gedownload") {
                setInputActive(false);
                pushUser(opt);

                // Belangrijk: hier tonen we de definitieve prompt (uit stap 3 of fallback)
                await pushBotAsync(
                    `Voer dit document nu in je AI in met deze instructies: ${instructions}`
                );

                // Gelukt?
                await pushBotAsync('Is het gelukt om het werkblad in je AI te gebruiken?');
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
                await pushBotAsync('Ben je tevreden met de (verbeterde) som?');
                setStage(3);
                setInputActive(true);
            } else {
                await pushBotAsync('Geen probleem—open het werkblad nogmaals, voer het in je AI in en probeer het opnieuw.');
                setStage(1);
                setInputActive(true);
            }
            return;
        }

        // STAGE 3 — tevreden?
        if (stage === 3) {
            setInputActive(false);
            pushUser(opt);

            if (opt === 'Ja') {
                await pushBotAsync('Mooi. Vul nu je definitieve verhaaltjessom in.');
                setStage(4);
                setInputActive(true);
            } else {
                await pushBotAsync('Pas je som nog even aan met behulp van het werkblad en probeer het opnieuw.');
                setStage(1);
                setInputActive(true);
            }
            return;
        }

        // STAGE 5 — CTA: pas hier echt door
        if (stage === 5 && opt === 'Ga naar Stap 5') {
            const payload = pendingPayloadRef.current || {};
            nextStep(payload, 5);
        }
    };

    // Vrij typen — alleen bij stage 4 (definitieve som)
    const handleSubmit = async () => {
        const text = (inputValue || '').trim();
        if (!inputActive || !text) return;

        if (stage === 4) {
            setInputActive(false);
            pushUser(text);
            setInputValue('');

            // Nog niet door: eerst bufferen
            pendingPayloadRef.current = {
                step4Doc: {
                    source: 'Voorbeeld-werkblad (redactiesommen.nl)',
                    sourceUrl: 'https://www.123lesidee.nl/index.php/site/links/2258',
                    finalStory: text,
                    lastEdit: new Date().toISOString(),
                    meta: {
                        group,
                        goal,
                        theme: s3?.chosenTheme || 'jouw gekozen thema',
                        length: (s3?.lengthChoice || 'kort'),
                        format: (s3?.formatChoice || 'verhaaltjessom'),
                        tone: (s3?.toneChoice || 'vriendelijk en duidelijk'),
                    },
                },
            };

            await pushBotAsync('Top, je definitieve som is opgeslagen.');
            await pushBotAsync('Klaar? Klik dan hieronder op Ga naar Stap 5.');
            setStage(5);
            setInputActive(true);
        }
    };

    return (
        <AppWrapper progress={70}>
            <div className="flex flex-col h-full">
                <ChatWindow chat={chat} />

                <div className="border-t border-white/10">
                    <TypeBar
                        options={options}
                        onSelect={handleSelect}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        inputActive={inputActive && stage === 4}   // vrij typen alleen voor de definitieve som
                        onSubmitInput={handleSubmit}
                    />
                </div>
            </div>
        </AppWrapper>
    );
}
