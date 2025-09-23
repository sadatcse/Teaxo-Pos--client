import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import UseAxiosSecure from './../../Hook/UseAxioSecure';

// Import step components (we will create these next)
import Step1Company from './Step/Step1Company';
import Step2Categories from './Step/Step2Categories';
import Step3Products from './Step/Step3Products';
import Step4Tables from './Step/Step4Tables';
import Step5Users from './Step/Step5Users';
import Step6Review from './Step/Step6Review';


const STEPS = [
    { title: "Branch Info", component: Step1Company },
    { title: "Categories", component: Step2Categories },
    { title: "Products", component: Step3Products },
    { title: "Tables", component: Step4Tables },
    { title: "Users", component: Step5Users },
    { title: "Review & Submit", component: Step6Review },
];

const NewBranchWizard = () => {
    const axiosSecure = UseAxiosSecure();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State to hold all data from the wizard
    const [wizardData, setWizardData] = useState({
        company: {},
        categories: [],
        products: [],
        tables: [],
        users: []
    });

    const handleNext = (stepData) => {
        setWizardData(prev => ({ ...prev, ...stepData }));
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axiosSecure.post('/branch/setup-wizard', wizardData);
            Swal.fire({
                icon: 'success',
                title: 'Branch Created!',
                text: `${wizardData.company.name} has been set up successfully.`,
            });
            // Optionally redirect or reset state here
            setCurrentStep(0);
            setWizardData({ company: {}, categories: [], products: [], tables: [], users: [] });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.message || 'Something went wrong!',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const CurrentStepComponent = STEPS[currentStep].component;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">New Branch Setup Wizard</h1>
            
            {/* Progress Bar */}
            <ul className="steps w-full mb-8">
                {STEPS.map((step, index) => (
                    <li key={step.title} className={`step ${index <= currentStep ? 'step-primary' : ''}`}>
                        {step.title}
                    </li>
                ))}
            </ul>

            {/* Step Content */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <CurrentStepComponent 
                    data={wizardData} 
                    onNext={handleNext} 
                    onPrev={handlePrev}
                    isFirstStep={currentStep === 0}
                    isLastStep={currentStep === STEPS.length - 1}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default NewBranchWizard;