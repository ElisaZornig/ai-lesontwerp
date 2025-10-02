import React, { useState } from 'react';
import { exportPDF } from '../components/PDFExporter';

const Step7Reflection = ({ answers }) => {
    const [reflection, setReflection] = useState('');

    const handleExport = () => {
        exportPDF('pdfContent', 'AI_Lesmaker.pdf');
    };

    return (
        <div>
      <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Wat heb je geleerd?"
          className="border p-2 rounded w-full mb-2"
      />
            <button onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded mb-4">PDF opslaan</button>

            <div id="pdfContent" className="p-4 border mt-4 bg-white text-black">
                <h2 className="text-xl font-bold mb-2">Jouw AI-lesmaker resultaten</h2>
                <p><strong>Stap 1:</strong> {answers.step1Answer}</p>
                <p><strong>Stap 2:</strong> {JSON.stringify(answers.step2Info)}</p>
                <p><strong>Stap 3:</strong> {JSON.stringify(answers.step3Prompt)}</p>
                <p><strong>Stap 4:</strong> {answers.step4Doc}</p>
                <p><strong>Stap 5:</strong> {answers.step5Image}</p>
                <p><strong>Stap 6:</strong> {answers.step6Song}</p>
                <p><strong>Reflectie:</strong> {reflection}</p>
            </div>
        </div>
    );
};

export default Step7Reflection;
