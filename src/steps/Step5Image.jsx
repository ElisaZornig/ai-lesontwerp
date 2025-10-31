// Step5Image.jsx — zelfde structuur als stap 3/4 (chat[] + pushBotAsync + TypeBar + expliciete CTA)
import React, { useEffect, useRef, useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

export default function Step5Image({ nextStep, answers = {} }) {
    // Basisdata uit eerdere stappen
    const info = answers?.step2Info || {};
    const s3   = answers?.step3Prompt || {};
    const s4   = answers?.step4Doc    || {};
    const group = info?.group || '[groep]';
    const goal  = info?.goal  || '[leerdoel]';

    // Chat & state
    const [chat, setChat] = useState([]);
    const [inputActive, setInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Stages:
    // 0=intro, 1=Gemini-link + pauze, 2=gelukt?, 25=pro-check, 3=upload, 4=CTA
    const [stage, setStage] = useState(0);

    // Upload-state
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileName, setFileName] = useState(null);

    // Buffer voor export; pas bij CTA doorsturen
    const pendingPayloadRef = useRef(null);

    // Helpers (zoals in stap 3/4)
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

    // Prompt-tip gebaseerd op de som en eerdere keuzes
    const buildImagePromptTip = () => {
        const som = s4?.finalStory?.slice(0, 240) || 'de verhaaltjessom die je net hebt gemaakt';
        const theme  = s3?.chosenTheme  || 'jouw gekozen thema';
        const tone   = s3?.toneChoice   || 'vriendelijk en duidelijk';

        // Soorten afbeeldingen en keuzes
        const guidance = [
            'Kies een type beeld dat de situatie uitlegt (niet het antwoord):',
            '- illustratie van de scene: personen, objecten en omgeving uit de som',
            '- eenvoudige strip van 2 vakjes: situatie links, vraag rechts (geen tekstballonnen nodig)',
            '- stilleven van objecten: precies de spullen die in de som voorkomen, netjes geschikt',
            '- pictogramset: 3 tot 6 simpele pictogrammen die de kernobjecten tonen',
            'Vermijd tekst in beeld; maximaal 2 woorden als label. Vermijd cijfers of berekeningen.'
        ].join('\n');

        const prompt = [
            `Maak één ondersteunende afbeelding bij deze som. Laat de situatie zien, niet de uitwerking.`,
            `Context: ${som}${s4?.finalStory && s4.finalStory.length > 240 ? '…' : ''}`,
            `Stijl: eenvoudig, klaslokaal-proof, ${String(tone).toLowerCase()}.`,
            `Thema: ${theme}.`,
            `Geen tekst, geen cijfers, geen oplossingsstappen.`,
            `Kadrering: centraal, voldoende witruimte, duidelijke objecten.`
        ].join(' ');

        return { guidance, prompt };
    };

    const { guidance, prompt: imagePromptTip } = buildImagePromptTip();

    // Startflow
    useEffect(() => {
        (async () => {
            setInputActive(false);

            // Intro
            await pushBotAsync('AI kan ook afbeeldingen maken. Je hebt al geoefend met goede prompts; gebruik die kennis nu voor een ondersteunende afbeelding bij je som.');

            // Uitleg over soorten beelden en hoe te kiezen
            await pushBotAsync(guidance);

            // Link + waar je Afbeeldingen genereren vindt
            await pushBotAsync('Open gemini.google.com. Onderaan bij Tools (icoon met twee streepjes en bolletjes) zet je Afbeeldingen genereren aan. Formuleer daarna je prompt. Tip: je kunt onderstaand voorbeeld kopiëren en aanpassen.');

            // Prompt-tip
            await pushBotAsync(`Voorbeeldprompt: ${imagePromptTip}`);

            // Pauze: opties in de TypeBar
            setStage(1);
            setInputActive(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Opties per stage
    let options = [];
    if (stage === 1) options = ['Open Gemini', 'Ik heb een afbeelding gegenereerd'];
    else if (stage === 2) options = ['Ja', 'Nee'];
    else if (stage === 25) options = ['Ja, Pro is op', 'Nee, ik probeer het nog een keer'];
    else if (stage === 4) options = ['Ga naar Stap 6'];

    // Klik op opties
    const handleSelect = async (opt) => {
        // STAGE 1 — link & pauze
        if (stage === 1) {
            if (opt === 'Open Gemini') {
                window.open('https://gemini.google.com', '_blank', 'noopener,noreferrer');
                return; // blijf in stage 1 tot ze bevestigen
            }
            if (opt === 'Ik heb een afbeelding gegenereerd') {
                setInputActive(false);
                pushUser(opt);

                // Gelukt?
                await pushBotAsync('Is het gelukt om Afbeeldingen genereren aan te zetten en je afbeelding te maken?');
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
                await pushBotAsync('Top. Upload hieronder je afbeelding, dan voegen we die toe aan de PDF.');
                setStage(3);
                setInputActive(false); // upload via het blok
            } else {
                await pushBotAsync('Is je Pro op? Als dat zo is, mag je deze stap overslaan en gaan we direct door naar de volgende stap.');
                setStage(25);
                setInputActive(true);
            }
            return;
        }

        // STAGE 25 — pro op?
        if (stage === 25) {
            setInputActive(false);
            pushUser(opt);

            if (opt === 'Ja, Pro is op') {
                await pushBotAsync('Geen probleem. Je mag deze stap overslaan. Je kunt later altijd nog een afbeelding toevoegen.');
                // sla een lege step5Image op zodat Step7 weet dat er niets is
                pendingPayloadRef.current = { step5Image: { skipped: true } };
                await pushBotAsync('Klik hieronder op Ga naar Stap 6 om verder te gaan.');
                setStage(4);
                setInputActive(true);
            } else {
                await pushBotAsync('Open Gemini opnieuw, zet Afbeeldingen genereren aan en probeer het nog een keer. Als het alsnog niet lukt, kun je de stap overslaan.');
                setStage(1);
                setInputActive(true);
            }
            return;
        }

        // STAGE 4 — CTA
        if (stage === 4 && opt === 'Ga naar Stap 6') {
            const payload = pendingPayloadRef.current || {};
            nextStep(payload, 6);
        }
    };

    // Upload handler
    const handleFile = async (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target.result;
            setPreviewUrl(dataUrl);
            setFileName(file.name);

            // Buffer opslaan; nog niet door
            pendingPayloadRef.current = {
                step5Image: {
                    fileName: file.name,
                    dataUrl,
                    meta: { group, goal },
                },
            };

            await pushBotAsync('Je afbeelding is opgeslagen. Klaar om door te gaan?');
            await pushBotAsync('Klik hieronder op Ga naar Stap 6.');
            setStage(4);
            setInputActive(true);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {}; // geen vrije tekst in deze stap

    // Uploadblok (zichtbaar bij stage 3)
    const Uploader = () => (
        <div className="p-4 border border-white/15 rounded-xl mt-2">
            <label className="block text-sm mb-2">Upload je afbeelding (PNG/JPG/WebP):</label>
            <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {previewUrl && (
                <div className="mt-3">
                    <img
                        src={previewUrl}
                        alt={fileName || 'Geüploade afbeelding'}
                        className="max-h-48 rounded-lg shadow"
                    />
                    <div className="text-xs mt-1 opacity-80">{fileName}</div>
                </div>
            )}
        </div>
    );

    return (
        <AppWrapper progress={85}>
            <div className="flex flex-col h-full">
                <ChatWindow chat={chat} />

                {stage === 3 && (
                    <div className="px-4">
                        <Uploader />
                    </div>
                )}

                <div className="border-t border-white/10">
                    <TypeBar
                        options={options}
                        onSelect={handleSelect}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        inputActive={false}
                        onSubmitInput={handleSubmit}
                    />
                </div>
            </div>
        </AppWrapper>
    );
}
