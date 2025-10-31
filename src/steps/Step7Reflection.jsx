// src/steps/Step7Reflection.jsx
import React, { useState } from 'react';
import AppWrapper from '../components/AppWrapper';
import { exportPDF } from '../components/PDFExporter';

const Step7Reflection = ({ answers = {} }) => {
    const [reflection, setReflection] = useState('');

    const handleExport = async () => {
        // De reflectie staat live in de DOM en wordt zo meegepakt in de PDF
        await exportPDF('pdfContent', 'AI-lespakket.pdf');
    };

    const s1 = answers.step1Answer;
    const s2 = answers.step2Info || {};
    const s3 = answers.step3Prompt || {};
    const s4 = answers.step4Doc || {};
    const s5 = answers.step5Image || {};
    const s6 = answers.step6Song || {};

    return (
        <AppWrapper progress={100}>
            <div className="flex flex-col h-full">

                {/* Bedieningsbalk */}
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-white text-xl mb-2">Stap 7 — Overzicht en export</h2>
                    <p className="text-white/80">
                        Hieronder zie je jouw complete pakket. Vul eventueel nog een korte reflectie in en klik daarna op
                        PDF opslaan.
                    </p>
                </div>

                {/* Reflectie invoer */}
                <div className="p-4">
                    <label className="block text-white/90 mb-2">Reflectie (optioneel)</label>
                    <textarea
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="Wat heb je geleerd? Wat werkte goed? Wat zou je de volgende keer anders doen?"
                        className="w-full min-h-[96px] p-3 rounded-lg bg-white text-gray-900"
                    />
                    <div className="mt-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
                        >
                            PDF opslaan
                        </button>
                    </div>
                </div>

                {/* Exportbare inhoud */}
                <div id="pdfContent" className="p-6 bg-white text-gray-900 m-4 rounded-xl shadow">
                    <style>{`
            .export-section h3 { margin: 0 0 8px; font-size: 18px; line-height: 1.35; }
            .export-section p { margin: 4px 0; }
            .export-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
            @media print {
              .page-break { page-break-before: always; }
            }
            /* Zorg dat lange tekst netjes afbreekt en nieuwe regels bewaart */
            .prelike { white-space: pre-wrap; word-wrap: break-word; }
            img.export-img { max-width: 100%; height: auto; border-radius: 8px; }
            .muted { color: #555; font-size: 12px; }
            ul.meta { margin: 6px 0 0; padding-left: 16px; }
          `}</style>

                    <h2 className="text-2xl mb-3">AI-lesmaker resultaten</h2>

                    <div className="export-section">
                        <h3>Stap 1 — Start</h3>
                        <p>{s1 ? 'Voltooid' : '—'}</p>
                    </div>

                    <div className="export-section">
                        <h3>Stap 2 — Lesgegevens</h3>
                        <p>Naam: {s2.name || '—'}</p>
                        <p>Groep: {s2.group || '—'}</p>
                        <p>Leerdoel: {s2.goal || '—'}</p>
                    </div>

                    <div className="export-section">
                        <h3>Stap 3 — Promptkeuzes</h3>
                        <p>Thema: {s3.chosenTheme || s3.theme || '—'}</p>
                        <p>Lengte: {s3.lengthChoice || s3.length || '—'}</p>
                        <p>Format: {s3.formatChoice || '—'}</p>
                        <p>Toon: {s3.toneChoice || '—'}</p>
                        {s3.finalPrompt && (
                            <>
                                <p className="mt-1">Eindprompt</p>
                                <p className="prelike">{s3.finalPrompt}</p>
                            </>
                        )}
                    </div>

                    <div className="export-section page-break">
                        <h3>Stap 4 — Definitieve verhaaltjessom</h3>
                        {s4.finalStory ? (
                            <>
                                <p className="prelike">{s4.finalStory}</p>
                                <p className="muted">
                                    Bron: {s4.source || 'Voorbeeld-werkblad'} {s4.sourceUrl ? `— ${s4.sourceUrl}` : ''}
                                </p>
                                {s4.meta && (
                                    <ul className="meta">
                                        {s4.meta.group && <li>Groep: {s4.meta.group}</li>}
                                        {s4.meta.goal && <li>Leerdoel: {s4.meta.goal}</li>}
                                        {s4.meta.theme && <li>Thema: {s4.meta.theme}</li>}
                                        {s4.meta.length && <li>Lengte: {s4.meta.length}</li>}
                                        {s4.meta.format && <li>Format: {s4.meta.format}</li>}
                                        {s4.meta.tone && <li>Toon: {s4.meta.tone}</li>}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <p>—</p>
                        )}
                    </div>

                    <div className="export-section">
                        <h3>Stap 5 — Ondersteunende afbeelding</h3>
                        {s5.dataUrl ? (
                            <>
                                <img className="export-img" src={s5.dataUrl} alt={s5.fileName || 'Afbeelding bij de som'} />
                                <p className="muted">{s5.fileName || ''}</p>
                            </>
                        ) : s5.skipped ? (
                            <p>Overgeslagen</p>
                        ) : (
                            <p>—</p>
                        )}
                    </div>

                    <div className="export-section">
                        <h3>Stap 6 — Song</h3>
                        {s6.link ? (
                            <p>Link: {s6.link}</p>
                        ) : s6.skipped ? (
                            <p>Overgeslagen</p>
                        ) : (
                            <p>—</p>
                        )}
                    </div>

                    <div className="export-section page-break">
                        <h3>Reflectie</h3>
                        <p className="prelike">{reflection || '—'}</p>
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
};

export default Step7Reflection;
