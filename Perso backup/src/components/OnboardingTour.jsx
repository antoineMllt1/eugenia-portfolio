import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';

const OnboardingTour = () => {
    const { isStudentMode } = useAuth();
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Start tour only when student mode is activated for the first time (simulated)
        if (isStudentMode) {
            setRun(true);
        } else {
            setRun(false);
        }
    }, [isStudentMode]);

    const steps = [
        {
            target: 'body',
            content: 'Welcome to the Student Area! Let me show you around.',
            placement: 'center',
        },
        {
            target: 'a[href="/dashboard"]',
            content: 'Here you can submit your projects for the gallery.',
        },
        {
            target: 'a[href="/map"]',
            content: 'Check out the Networking Map to find students near you.',
        },
        {
            target: 'a[href="/chat"]',
            content: 'Connect with your peers via the internal chat.',
        },
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    primaryColor: '#e33054', // Eugenia Red
                    textColor: '#1f0d19',
                    zIndex: 10000,
                },
            }}
            callback={handleJoyrideCallback}
        />
    );
};

export default OnboardingTour;
