// src/steps/Step3Prompt.jsx
import React, { useEffect, useMemo, useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import TypeBar from '../components/TypeBar';

const themeByGroup = {
    '1/2': ['Dieren', 'Speeltuin', 'Verjaardag'],
    '3/4': ['Dierenpark', 'Sportdag', 'Winkel'],
    '5/6': ['Pretpark', 'Bioscoop', 'Voetbaltoernooi'],
    '7/8': ['Schoolfeest', 'Start-up', 'Reizen'],
};

const Step3Prompt = ({ nextStep, answers = {} }) => {
    const info = answers?.step2Info || {};
    const { name, group, goal } = info;

    // Chat & invoer
    const [chat, setChat] = useState([]);
    const [inputActive, setInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Keuzes / iteraties
    const [userSummaries, setUserSummaries] = useState([]); // korte reflecties per ronde
    const [chosenTheme, setChosenTheme] = useState('');
    const [lengthChoice, setLengthChoice] = useState('');
    const [formatChoice, setFormatChoice] = useState('');
    const [toneChoice, setToneChoice] = useState('');
    const [showNextOption, setShowNextOption] = useState(false);

    // Nieuw: verberg opties direct na een keuze tot de samenvatting is gegeven
    const [waitingForSummary, setWaitingForSummary] = useState(false);

    // 0=Intro, 1=Basisprompt + samenvatting, 2=Thema + samenvatting, 3=Lengte + samenvatting,
    // 4=Format + samenvatting, 5=Toon + samenvatting, 6=Samenvattingsbubble + CTA
    const [stage, setStage] = useState(0);

    const themes = useMemo(() => themeByGroup[group] || ['Thema'], [group]);
    const lengthOptions = useMemo(() => ['Kort', 'Gemiddeld', 'Lang'], []);
    const formatOptions = useMemo(() => ['Vraag + Antwoord', 'Meerkeuze', 'Stappenplan', 'Tabel'], []);
    const toneOptions = useMemo(() => ['Vrolijk', 'Neutraal', 'Onderzoekend', 'Verhalend', 'Inclusief'], []);

    // Helpers
    const pushUser = (text) =>
        setChat((c) => [...c, { fromUser: true, message: text, render: <ChatBubble message={text} fromUser /> }]);

    const pushBotAsync = (text) =>
        new Promise((resolve) => {
            setChat((c) => [
                ...c,
                { fromUser: false, message: text, render: <ChatBubble message={text} fromUser={false} onDoneTyping={resolve} /> },
            ]);
        });

    // Startflow
    useEffect(() => {
        (async () => {
            setInputActive(false);
            await pushBotAsync(
                `We gaan je prompt stap voor stap aanscherpen, ${name || 'leerkracht'}. Eerst de kale opdracht:`
            );
            await pushBotAsync(
                `Plak dit in je AI-chat en typ hieronder kort wat je terugkreeg:\n\n"Maak een verhaaltjessom voor groep ${group || '?'} met doel ${goal || '...'}."`
            );
            setStage(1);
            setInputActive(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Eindprompt samenstellen (alleen voor de finale bubble)
    const buildFinalPrompt = () => {
        const parts = [
            `Maak een verhaaltjessom voor groep ${group || '?'} met doel ${goal || '...'}.`,
        ];
        if (chosenTheme)
            parts.push(`Gebruik het thema "${chosenTheme}" en kies voorbeelden passend bij groep ${group || '?'}.`);
        if (lengthChoice)
            parts.push(`Maak de opgave ${lengthChoice.toLowerCase()} en gebruik geschikte getallen voor dit niveau.`);
        if (formatChoice)
            parts.push(`Geef de ${formatChoice.toLowerCase()} en lever ook het juiste antwoord en een korte toelichting.`);
        if (toneChoice)
            parts.push(`Hanteer een ${toneChoice.toLowerCase()} toon en gebruik inclusief, toegankelijk taalgebruik.`);
        return parts.join(' ');
    };

    // TypeBar opties per stage (leeg als we op samenvatting wachten)
    let options = [];
    if (!waitingForSummary) {
        if (stage === 2) options = themes;
        else if (stage === 3) options = lengthOptions;
        else if (stage === 4) options = formatOptions;
        else if (stage === 5) options = toneOptions;
        else if (stage === 6) options = ['Ga naar Stap 4'];
    }

    // Submit van vrije tekst (reflectie-samenvatting of eerste ronde)
    const handleSubmit = async () => {
        const text = (inputValue || '').trim();
        if (!inputActive || !text) return;

        // reflectie samenvatting in rondes 1..5
        if ([1, 2, 3, 4, 5].includes(stage)) {
            setInputActive(false);
            pushUser(text);
            setUserSummaries((arr) => [...arr, { round: stage, summary: text }]);
            setInputValue('');

            if (stage === 1) {
                await pushBotAsync('Mooi! Waarschijnlijk werkte dit “ongeveer”, maar nog vrij algemeen.');
                await pushBotAsync('Context helpt: AI weet dan beter wat je bedoelt. Kies een thema dat past bij je groep — dan wordt de som herkenbaarder.');
                setStage(2);
                setWaitingForSummary(false); // nieuwe ronde → opties mogen verschijnen
                setInputActive(true);
                return;
            }

            if (stage === 2) {
                await pushBotAsync('Helder! Met thema wordt de opdracht vaak relevanter voor je leerlingen.');
                await pushBotAsync('Nu de lengte/niveau: zo voorkom je te simpel of te lang.');
                setStage(3);
                setWaitingForSummary(false);
                setInputActive(true);
                return;
            }

            if (stage === 3) {
                await pushBotAsync('Top! Lengte en niveau geven richting aan de AI.');
                await pushBotAsync('Nu het format: dan wordt de output direct bruikbaar in de klas.');
                setStage(4);
                setWaitingForSummary(false);
                setInputActive(true);
                return;
            }

            if (stage === 4) {
                await pushBotAsync('Nice!');
                await pushBotAsync('Tot slot: kies een toon (en inclusieve taal) voor de juiste sfeer.');
                setStage(5);
                setWaitingForSummary(false);
                setInputActive(true);
                return;
            }

            if (stage === 5) {
                const finalPrompt = buildFinalPrompt();
                await pushBotAsync('Fantastisch! Kijk naar je uitgewerkte prompt hieronder:');
                await pushBotAsync(`**Eindprompt**:\n${finalPrompt}`);
                await pushBotAsync('Dekt dit wat je wilt? Als het goed is, ga dan door.');
                setShowNextOption(true);
                setStage(6);
                setWaitingForSummary(false);
                setInputActive(true);
                return;
            }
        }
    };

    // Selecties via knoppen — verberg opties direct na klik
    const handleSelect = async (opt) => {
        if (stage === 2) {
            setChosenTheme(opt);
            setInputActive(false);
            setWaitingForSummary(true); // 👈 verberg opties meteen
            pushUser(`Thema: ${opt}`);

            await pushBotAsync(
                `Voeg aan je prompt toe: "Gebruik het thema '${opt}' en kies voorbeelden passend bij groep ${group || '?'}."`
            );
            await pushBotAsync('Vraag dit opnieuw aan je AI-chat en typ hieronder kort wat je terugkreeg.');
            setInputActive(true);
            return;
        }

        if (stage === 3) {
            setLengthChoice(opt);
            setInputActive(false);
            setWaitingForSummary(true); // 👈 verberg opties meteen
            pushUser(`Lengte: ${opt}`);

            await pushBotAsync(
                `Voeg toe: "Maak de opgave ${opt.toLowerCase()} en gebruik geschikte getallen voor dit niveau."`
            );
            await pushBotAsync('Vraag het opnieuw aan je AI-chat en typ hieronder kort wat je terugkreeg.');
            setInputActive(true);
            return;
        }

        if (stage === 4) {
            setFormatChoice(opt);
            setInputActive(false);
            setWaitingForSummary(true); // 👈 verberg opties meteen
            pushUser(`Format: ${opt}`);

            await pushBotAsync(
                `Voeg toe: "Geef de ${opt.toLowerCase()} en lever ook het juiste antwoord en een korte toelichting."`
            );
            await pushBotAsync('Vraag het opnieuw aan je AI-chat en typ hieronder kort wat je terugkreeg.');
            setInputActive(true);
            return;
        }

        if (stage === 5) {
            setToneChoice(opt);
            setInputActive(false);
            setWaitingForSummary(true); // 👈 verberg opties meteen
            pushUser(`Toon: ${opt}`);

            await pushBotAsync(
                `Voeg toe: "Hanteer een ${opt.toLowerCase()} toon en gebruik inclusief, toegankelijk taalgebruik."`
            );
            await pushBotAsync('Vraag dit nog één keer aan je AI-chat en typ hieronder kort wat je terugkreeg.');
            setInputActive(true);
            return;
        }

        if (stage === 6 && opt === 'Ga naar Stap 4') {
            const finalPrompt = buildFinalPrompt();
            nextStep({
                step3Prompt: {
                    rawPrompt: `Maak een verhaaltjessom voor groep ${group || '?'} met doel ${goal || '...'}.`,
                    iterations: [
                        { round: 1, change: 'basis', summary: userSummaries.find((r) => r.round === 1)?.summary || '' },
                        { round: 2, change: `thema: ${chosenTheme}`, summary: userSummaries.find((r) => r.round === 2)?.summary || '' },
                        { round: 3, change: `lengte: ${lengthChoice}`, summary: userSummaries.find((r) => r.round === 3)?.summary || '' },
                        { round: 4, change: `format: ${formatChoice}`, summary: userSummaries.find((r) => r.round === 4)?.summary || '' },
                        { round: 5, change: `toon: ${toneChoice}`, summary: userSummaries.find((r) => r.round === 5)?.summary || '' },
                    ],
                                     chosenTheme,
                                     lengthChoice,
                                     formatChoice,
                                     toneChoice,



            finalPrompt,
                },
            });
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
                        // input blijft aan tijdens samenvatten; CTA-fase schakelt vrij typen uit
                        inputActive={inputActive && !showNextOption}
                        onSubmitInput={async () => {
                            await handleSubmit();
                            // na samenvatting: opties weer aan voor volgende ronde
                            if (waitingForSummary) setWaitingForSummary(false);
                        }}
                    />
                </div>
            </div>
        </AppWrapper>
    );
};

export default Step3Prompt;
