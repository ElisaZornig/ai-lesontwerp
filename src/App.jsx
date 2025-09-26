import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import HelperVideo from './HelperVideo';

function ProgressBar({ step }) {
    const progress = ((step - 1) / 5) * 100; // intro = stap 0
    return (
        <div className="w-full bg-gray-300 rounded-full h-5 mb-6 shadow-inner">
            <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
}

function Step({ number, title, info, link, input, setInput, onNext, onBack, children, image }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6 max-w-3xl mx-auto"
        >
            <h2 className="text-2xl font-extrabold mb-4 text-purple-700">{title}</h2>

            {info && (
                <div className="bg-purple-100 p-4 rounded-lg mb-4 text-purple-800">
                    {info}
                </div>
            )}
            {image && (
                <img
                    src={image}
                    alt="Welkom Meme"
                    className="mx-auto rounded-lg shadow-lg"
                />
            )}

            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-purple-500 text-white px-5 py-2 rounded-lg hover:bg-purple-600 mb-4 inline-block"
                >
                    Ga naar AI-tool
                </a>
            )}

            {input !== undefined && (
                <textarea
                    placeholder="Plak hier je output"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full border-2 border-purple-300 rounded-lg p-3 mb-4 h-36 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            )}

            <div className="flex justify-between">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                        Terug
                    </button>
                )}
                <button
                    onClick={onNext}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                    {number === undefined ? "Start" : "Volgende"}
                </button>
            </div>

            {children}
        </motion.div>
    );
}

function App() {
    const [step, setStep] = useState(0); // 0 = intro
    const [promptOutput, setPromptOutput] = useState('');
    const [docOutput, setDocOutput] = useState('');
    const [imageOutput, setImageOutput] = useState('');
    const [musicOutput, setMusicOutput] = useState('');
    const [leerdoel, setLeerdoel] = useState('');
    const [jaargroep, setJaargroep] = useState('');
    const leerdoelenPerJaargroep = {
        '1/2': [
            'Optellen tot 20',
            'Aftrekken tot 20',
            'Herkennen van vormen',
        ],
        '3/4': [
            'Tafels van 1 t/m 10',
            'Breuken herkennen',
            'Klokkijken',
        ],
        '5/6': [
            'Decimale getallen',
            'Verhoudingen begrijpen',
            'Meten en schatten',
        ],
        '7/8': [
            'Procenten berekenen',
            'Algebraïsche expressies',
            'Grafieken interpreteren',
        ],
    };



    const handlePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("AI Lesmateriaal", 10, 10);
        doc.setFontSize(12);
        doc.text("Jaargroep:", 10, 130);
        doc.text(jaargroep || "Geen input", 10, 140);
        doc.text("Rekenleerdoel:", 10, 150);
        doc.text(leerdoel || "Geen input", 10, 160);
        doc.text("Verhaaltjessom:", 10, 20);
        doc.text(promptOutput || "Geen input", 10, 30);
        doc.text("Documentatie / extra context:", 10, 50);
        doc.text(docOutput || "Geen input", 10, 60);
        doc.text("Afbeelding:", 10, 80);
        doc.text(imageOutput || "Geen input", 10, 90);
        doc.text("Muziek / Audio:", 10, 110);
        doc.text(musicOutput || "Geen input", 10, 120);
        doc.save("AI_Lesmateriaal.pdf");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-6">
            <HelperVideo src="/videos/helper.mp4" />
            <h1 className="text-4xl font-extrabold text-center mb-6 text-purple-800">
                AI Lesmaker
            </h1>
            <ProgressBar step={step} />

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <Step
                        onNext={() => setStep(1)}
                        link="https://chat.openai.com"
                        title = "Welkom bij de AI Lesmaker! 🎉"
                        info="Misschien heb je al kennis van AI, misschien weet je net wat chatGPT is, deze activiteit is voor iedereen! Vandaag ga je door middel van het maken van een lesontwerp kennismaken met verschillende AI-tools. <br></br>Het is wel belangrijk dat je ingelogd ben in chatgpt of een ander AI-tool. Als je copilot op je laptop hebt staan kun je dat gebruiken. Je kunt chatgpt op je telefoon gebruiken of op je laptop, maar zorg dat je ingelogd bent."
                        image = "./images/sadteacher.gif"
                    >



                    </Step>
                )}

                {step === 1 && (
                    <Step
                        number={1}
                        title="Stap 1: Kies een rekenleerdoel"
                        info="Selecteer het rekenleerdoel dat past bij de jaargroep van je leerlingen."
                        onNext={() => setStep(2)}
                    >
                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">Jaargroep:</label>
                            <select
                                value={jaargroep}
                                onChange={(e) => setJaargroep(e.target.value)}
                                className="w-full border-2 border-purple-300 rounded-lg p-2 mb-4"
                            >
                                <option value="">Selecteer jaargroep</option>
                                <option value="1/2">1/2</option>
                                <option value="3/4">3/4</option>
                                <option value="5/6">5/6</option>
                                <option value="7/8">7/8</option>
                            </select>

                            {jaargroep && (
                                <>
                                    <label className="block mb-1 font-semibold">Rekenleerdoel:</label>
                                    <select
                                        value={leerdoel}
                                        onChange={(e) => setLeerdoel(e.target.value)}
                                        className="w-full border-2 border-purple-300 rounded-lg p-2 mb-2"
                                    >
                                        <option value="">Selecteer leerdoel</option>
                                        {leerdoelenPerJaargroep[jaargroep].map((doel, idx) => (
                                            <option key={idx} value={doel}>{doel}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                    </Step>
                )}


                {step === 2 && (
                    <Step
                        number={2}
                        title="Stap 2: Prompt engineering"
                        info="Hier leer je hoe je een goede prompt maakt voor een verhaaltjessom. Geef duidelijk onderwerp, groep en moeilijkheidsgraad op, en vraag eventueel om meerdere variaties."
                        link="https://chat.openai.com"
                        input={promptOutput}
                        setInput={setPromptOutput}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                )}

                {step === 3 && (
                    <Step
                        number={3}
                        title="Stap 3: Documentatie / extra context"
                        link="https://chat.openai.com"
                        input={docOutput}
                        setInput={setDocOutput}
                        onNext={() => setStep(4)}
                        onBack={() => setStep(2)}
                    />
                )}

                {step === 4 && (
                    <Step
                        number={4}
                        title="Stap 4: Afbeelding genereren"
                        link="https://openai.com/dall-e"
                        input={imageOutput}
                        setInput={setImageOutput}
                        onNext={() => setStep(5)}
                        onBack={() => setStep(3)}
                    />
                )}

                {step === 5 && (
                    <Step
                        number={5}
                        title="Stap 5: Muziek / audio"
                        link="https://soundraw.io"
                        input={musicOutput}
                        setInput={setMusicOutput}
                        onNext={handlePDF}
                        onBack={() => setStep(4)}
                    >
                        <p className="mb-2 text-gray-600 text-center">
                            Klik op "Volgende" om je PDF met alles te downloaden.
                        </p>
                    </Step>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
