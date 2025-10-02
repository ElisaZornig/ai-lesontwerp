import React, { useState } from 'react';
import ProgressBar from './components/ProgressBar';
import Step1Intro from './steps/Step1Intro';
import Step2Info from './steps/Step2Info';
import Step3Prompt from './steps/Step3Prompt';
import Step4Documents from './steps/Step4Documents';
import Step5Image from './steps/Step5Image';
import Step6Song from './steps/Step6Song';
import Step7Reflection from './steps/Step7Reflection';

const steps = [
    Step1Intro,
    Step2Info,
    Step3Prompt,
    Step4Documents,
    Step5Image,
    Step6Song,
    Step7Reflection
];

function App() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const StepComponent = steps[currentStep];

    const nextStep = (data) => {
        setAnswers({ ...answers, ...data });
        setCurrentStep((prev) => prev + 1);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <ProgressBar step={currentStep + 1} totalSteps={steps.length} />
            <StepComponent nextStep={nextStep} answers={answers} />
        </div>
    );
}

export default App;
