'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '../../store/quiz-store';
import { useIsMobile } from '../../utils/responsive';
import { playSound, vibrate } from '../../utils/enhanced-sounds';
import { useSystemSettings } from '../../contexts/system-settings-context';
import { animationClasses } from '../../utils/enhanced-animations';
import { useQuestionTransition, getBlockingOverlayClasses } from '../../utils/question-transitions';
import { getChallengeMode } from '../../utils/challengeModes';
import HeaderContent from '../../components/quiz/HeaderContent';
import { FractionInput } from '../../components/ui/FractionInput';
import { MobileTile } from '../../components/ui/MobileTile';

export default function QuizPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { settings: systemSettings } = useSystemSettings();
    const {
        settings,
        questions,
        currentQuestionIndex,
        timeRemaining,
        isQuizActive,
        isQuizCompleted,
        correctAnswersCount,
        incorrectAnswersCount,
        overallTimeRemaining,
        overallTimerActive,
        startQuiz,
        nextQuestion,
        submitAnswer,
        submitFractionAnswer,
        submitCurrencyAnswer,
        submitTimeAnswer,
        setTimeRemaining,
        setOverallTimeRemaining,
        completeQuiz,
    } = useQuizStore();

    const [userInput, setUserInput] = useState('');
    const [userFractionInput, setUserFractionInput] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [selectedFractionOption, setSelectedFractionOption] = useState<string | null>(null);
    const [selectedCurrencyOption, setSelectedCurrencyOption] = useState<string | null>(null);
    const [selectedTimeOption, setSelectedTimeOption] = useState<string | null>(null);

    // Refs for auto-focus
    const inputRef = useRef<HTMLInputElement>(null);
    const fractionInputRef = useRef<HTMLInputElement>(null);

    // Question transition animations
    const {
        transitionClasses,
        isUserInteractionBlocked,
        animationKey,
    } = useQuestionTransition(currentQuestionIndex, systemSettings.animations);

    const currentQuestion = questions[currentQuestionIndex];

    // Helper functions to check question types
    const isFractionQuestion = currentQuestion && currentQuestion.fractionAnswer !== undefined;
    const isCurrencyQuestion = currentQuestion && currentQuestion.currencyOptions !== undefined;
    const isTimeQuestion = currentQuestion && currentQuestion.timeOptions !== undefined;

    // Start quiz when component mounts
    useEffect(() => {
        if (questions.length > 0 && !isQuizActive && !isQuizCompleted) {
            startQuiz();
        }
    }, [questions, isQuizActive, isQuizCompleted, startQuiz]);

    // Clear all inputs and selections when question changes
    useEffect(() => {
        setUserInput('');
        setUserFractionInput('');
        setSelectedOption(null);
        setSelectedFractionOption(null);
        setSelectedCurrencyOption(null);
        setSelectedTimeOption(null);
    }, [currentQuestionIndex]);

    // Timer logic - pause during animations and check if timer is enabled
    useEffect(() => {
        if (!isQuizActive || !settings.timerEnabled || timeRemaining <= 0 || isUserInteractionBlocked) return;

        const timer = setInterval(() => {
            setTimeRemaining(timeRemaining - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isQuizActive, timeRemaining, setTimeRemaining, isUserInteractionBlocked, settings.timerEnabled]);

    // Overall timer logic - separate from question timer
    useEffect(() => {
        if (!isQuizActive || !settings.overallTimerEnabled || !overallTimerActive || overallTimeRemaining <= 0) return;

        const overallTimer = setInterval(() => {
            setOverallTimeRemaining(overallTimeRemaining - 1);
        }, 1000);

        return () => clearInterval(overallTimer);
    }, [isQuizActive, overallTimeRemaining, setOverallTimeRemaining, settings.overallTimerEnabled, overallTimerActive]);

    // Auto-advance when timer reaches 0 (only if timer is enabled)
    useEffect(() => {
        if (settings.timerEnabled && timeRemaining === 0 && isQuizActive) {
            handleTimeUp();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining, isQuizActive, settings.timerEnabled]);

    // Handle overall timer timeout
    useEffect(() => {
        if (settings.overallTimerEnabled && overallTimeRemaining === 0 && isQuizActive) {
            // Force end the quiz when overall timer reaches 0
            playSound('incorrect', systemSettings); // Play warning sound
            vibrate(300, systemSettings); // Strong vibration
            completeQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overallTimeRemaining, isQuizActive, settings.overallTimerEnabled]);

    // Redirect if no questions
    useEffect(() => {
        if (questions.length === 0) {
            router.push('/');
        }
    }, [questions.length, router]);

    // Redirect to results when quiz is completed
    useEffect(() => {
        if (isQuizCompleted) {
            router.push('/results');
        }
    }, [isQuizCompleted, router]);

    // Auto-focus input when new question starts or settings change
    useEffect(() => {
        if (currentQuestion && isQuizActive) {
            setTimeout(() => {
                if (settings.questionType === 'input') {
                    if (isFractionQuestion && fractionInputRef.current) {
                        fractionInputRef.current.focus();
                    } else if (!isFractionQuestion && inputRef.current) {
                        inputRef.current.focus();
                    }
                }
            }, 100); // Small delay to ensure rendering is complete
        }
    }, [currentQuestion, isQuizActive, settings.questionType, isFractionQuestion]);

    // Global Enter key handler
    useEffect(() => {
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !isUserInteractionBlocked && isQuizActive) {
                // Check if user can submit based on question type
                let canSubmit = false;

                if (isFractionQuestion) {
                    canSubmit = settings.questionType === 'input'
                        ? userFractionInput.trim().length > 0
                        : selectedFractionOption !== null;
                } else if (isCurrencyQuestion) {
                    canSubmit = settings.questionType === 'input'
                        ? userInput.trim().length > 0
                        : selectedCurrencyOption !== null;
                } else if (isTimeQuestion) {
                    canSubmit = settings.questionType === 'input'
                        ? userInput.trim().length > 0
                        : selectedTimeOption !== null;
                } else {
                    // Regular questions (integers, decimals)
                    canSubmit = settings.questionType === 'input'
                        ? userInput.trim().length > 0
                        : selectedOption !== null;
                }

                if (canSubmit) {
                    e.preventDefault();
                    handleSubmitAnswer();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyPress);
        return () => window.removeEventListener('keydown', handleGlobalKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isUserInteractionBlocked,
        isQuizActive,
        isFractionQuestion,
        isCurrencyQuestion,
        isTimeQuestion,
        settings.questionType,
        userInput,
        userFractionInput,
        selectedOption,
        selectedFractionOption,
        selectedCurrencyOption,
        selectedTimeOption
    ]);

    const handleTimeUp = () => {
        // Submit empty/null answer when time runs out
        if (isFractionQuestion) {
            if (settings.questionType === 'input') {
                submitAnswer(0); // Submit 0 for timeout on fraction input
            } else {
                submitAnswer(-1); // Submit -1 for timeout on fraction multiple choice
            }
        } else if (isCurrencyQuestion) {
            if (settings.questionType === 'input') {
                submitCurrencyAnswer(userInput || '');
            } else {
                submitCurrencyAnswer(''); // Submit empty string for timeout
            }
        } else if (isTimeQuestion) {
            if (settings.questionType === 'input') {
                submitTimeAnswer(userInput || '');
            } else {
                submitTimeAnswer(''); // Submit empty string for timeout
            }
        } else if (settings.questionType === 'input') {
            submitAnswer(userInput ? parseFloat(userInput) || 0 : 0);
        } else {
            submitAnswer(selectedOption || -1);
        }

        // Clear all inputs
        setUserInput('');
        setUserFractionInput('');
        setSelectedOption(null);
        setSelectedFractionOption(null);
        setSelectedCurrencyOption(null);
        setSelectedTimeOption(null);

        if (currentQuestionIndex >= questions.length - 1) {
            completeQuiz();
        } else {
            nextQuestion();
        }
    };

    const handleSubmitAnswer = () => {
        let isCorrect = false;

        if (isFractionQuestion) {
            // Handle fraction questions
            if (settings.questionType === 'input') {
                submitFractionAnswer(userFractionInput.trim());
            } else {
                // Multiple choice fraction question
                submitFractionAnswer(selectedFractionOption || '');
            }
        } else if (isCurrencyQuestion) {
            // Handle currency questions
            if (settings.questionType === 'input') {
                // For input, user enters currency value
                submitCurrencyAnswer(userInput.trim());
            } else {
                // Multiple choice currency question
                submitCurrencyAnswer(selectedCurrencyOption || '');
            }
        } else if (isTimeQuestion) {
            // Handle time questions
            if (settings.questionType === 'input') {
                // For input, user enters time value
                submitTimeAnswer(userInput.trim());
            } else {
                // Multiple choice time question
                submitTimeAnswer(selectedTimeOption || '');
            }
        } else {
            // Handle regular questions (integers, decimals)
            let answer: number;

            if (settings.questionType === 'input') {
                answer = parseFloat(userInput) || 0;
            } else {
                answer = selectedOption !== null ? selectedOption : -1;
            }

            submitAnswer(answer);
        }

        // Check if answer was correct (we need to check the updated question)
        const updatedQuestion = questions[currentQuestionIndex];
        if (updatedQuestion) {
            setTimeout(() => {
                const question = useQuizStore.getState().questions[currentQuestionIndex];
                isCorrect = question?.isCorrect || false;

                // Show visual and audio feedback
                if (isCorrect) {
                    playSound('correct', systemSettings);
                    vibrate([100, 50, 100], systemSettings);
                } else {
                    playSound('incorrect', systemSettings);
                    vibrate(200, systemSettings);
                }
            }, 100);
        }

        // Clear all inputs
        setUserInput('');
        setUserFractionInput('');
        setSelectedOption(null);
        setSelectedFractionOption(null);
        setSelectedCurrencyOption(null);
        setSelectedTimeOption(null);

        if (currentQuestionIndex >= questions.length - 1) {
            setTimeout(() => {
                playSound('completion', systemSettings);
                completeQuiz();
            }, 1500);
        } else {
            setTimeout(() => {
                nextQuestion();
                // Auto-focus after moving to next question
                setTimeout(() => {
                    if (settings.questionType === 'input') {
                        if (isFractionQuestion && fractionInputRef.current) {
                            fractionInputRef.current.focus();
                        } else if (!isFractionQuestion && inputRef.current) {
                            inputRef.current.focus();
                        }
                    }
                }, 100);
            }, 1500);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isUserInteractionBlocked) {
            // Check if user can submit based on question type
            let canSubmit = false;

            if (isFractionQuestion) {
                canSubmit = settings.questionType === 'input'
                    ? userFractionInput.trim().length > 0
                    : selectedFractionOption !== null;
            } else if (isCurrencyQuestion) {
                canSubmit = settings.questionType === 'input'
                    ? userInput.trim().length > 0
                    : selectedCurrencyOption !== null;
            } else if (isTimeQuestion) {
                canSubmit = settings.questionType === 'input'
                    ? userInput.trim().length > 0
                    : selectedTimeOption !== null;
            } else {
                // Regular questions (integers, decimals)
                canSubmit = settings.questionType === 'input'
                    ? userInput.trim().length > 0
                    : selectedOption !== null;
            }

            if (canSubmit) {
                handleSubmitAnswer();
            }
        }
    };

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 dark:from-indigo-900 dark:via-purple-800 dark:to-pink-900 flex items-center justify-center p-4">
                <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl text-center ${isMobile ? 'p-6 max-w-sm' : 'p-8 max-w-md'}`}>
                    <div className={`${animationClasses.spin(systemSettings)} rounded-full h-16 w-16 border-b-2 border-purple-500 dark:border-purple-400 mx-auto`}></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const headerContent = (<HeaderContent
        settings={settings}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        correctAnswersCount={correctAnswersCount}
        incorrectAnswersCount={incorrectAnswersCount}
        timeRemaining={timeRemaining}
        overallTimeRemaining={overallTimeRemaining}
        animationClasses={animationClasses}
        systemSettings={systemSettings}
        progress={progress}
    />);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-500 dark:from-violet-900 dark:via-purple-800 dark:to-indigo-900">
            {/* Header: mobile and desktop differ, rest is unified */}

            {isMobile && (<div className="bg-white dark:bg-slate-800 shadow-lg p-4 sticky top-0 z-10">{headerContent}</div>)}

            {/* Unified Content for both mobile and desktop */}
            <div className={`flex items-center justify-center p-4 min-h-screen`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
                    {!isMobile && (<div className="text-center mb-8">{headerContent}</div>)}
                    {/* Question */}
                    <div className="text-center mb-8">
                        <div key={animationKey} className={`text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6 p-6 bg-gray-50 dark:bg-slate-800 rounded-xl ${transitionClasses}`}>
                            {currentQuestion.variable ? (
                                <div>
                                    <div className="text-xl text-purple-600 dark:text-purple-400 mb-2">Solve for {currentQuestion.variable}:</div>
                                    <div>{currentQuestion.question}</div>
                                </div>
                            ) : currentQuestion.variables && currentQuestion.variables.length > 0 ? (
                                <div>
                                    <div className="text-xl text-purple-600 dark:text-purple-400 mb-2">Solve for {currentQuestion.variables.join(' and ')}</div>
                                    <div>{currentQuestion.question}</div>
                                </div>
                            ) : (
                                `${currentQuestion.question} = ?`
                            )}
                        </div>
                    </div>

                    {/* Answer Input */}
                    <div className={`mb-8 ${getBlockingOverlayClasses(isUserInteractionBlocked)}`}>
                        {settings.questionType === 'input' ? (
                            <div>
                                {isFractionQuestion ? (
                                    <FractionInput
                                        ref={fractionInputRef}
                                        value={userFractionInput}
                                        onChange={setUserFractionInput}
                                        placeholder="Enter fraction (e.g., 3/4 or 1 2/3)"
                                        fullWidth
                                    />
                                ) : (
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="w-full px-6 py-4 text-3xl text-center border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                                        placeholder={
                                            currentQuestion.variable ? `Enter value for ${currentQuestion.variable}` :
                                                currentQuestion.variables && currentQuestion.variables.length > 0 ? `Enter value for ${currentQuestion.variables[0]}` :
                                                    "Enter your answer"
                                        }
                                        autoFocus
                                        inputMode="numeric"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isFractionQuestion && currentQuestion.fractionOptions ? (
                                    // Fraction multiple choice options
                                    currentQuestion.fractionOptions.map((option, index) => (
                                        <MobileTile
                                            key={index}
                                            title={`${String.fromCharCode(65 + index)}. ${option}`}
                                            isSelected={selectedFractionOption === option}
                                            onClick={() => setSelectedFractionOption(option)}
                                            compact={true}
                                        />
                                    ))
                                ) : isCurrencyQuestion && currentQuestion.currencyOptions ? (
                                    // Currency multiple choice options
                                    currentQuestion.currencyOptions.map((option, index) => (
                                        <MobileTile
                                            key={index}
                                            title={`${String.fromCharCode(65 + index)}. ${option}`}
                                            isSelected={selectedCurrencyOption === option}
                                            onClick={() => setSelectedCurrencyOption(option)}
                                            compact={true}
                                        />
                                    ))
                                ) : isTimeQuestion && currentQuestion.timeOptions ? (
                                    // Time multiple choice options
                                    currentQuestion.timeOptions.map((option, index) => (
                                        <MobileTile
                                            key={index}
                                            title={`${String.fromCharCode(65 + index)}. ${option}`}
                                            isSelected={selectedTimeOption === option}
                                            onClick={() => setSelectedTimeOption(option)}
                                            compact={true}
                                        />
                                    ))
                                ) : (
                                    // Regular multiple choice options (integers and decimals)
                                    currentQuestion.options?.map((option, index) => (
                                        <MobileTile
                                            key={index}
                                            title={`${String.fromCharCode(65 + index)}. ${option}`}
                                            isSelected={selectedOption === option}
                                            onClick={() => setSelectedOption(option)}
                                            compact={true}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button (used for both mobile and desktop) */}
                    <div className="space-y-4">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={
                                isFractionQuestion
                                    ? (settings.questionType === 'input'
                                        ? !userFractionInput.trim()
                                        : selectedFractionOption === null)
                                    : isCurrencyQuestion
                                        ? (settings.questionType === 'input'
                                            ? !userInput.trim()
                                            : selectedCurrencyOption === null)
                                        : isTimeQuestion
                                            ? (settings.questionType === 'input'
                                                ? !userInput.trim()
                                                : selectedTimeOption === null)
                                            : (settings.questionType === 'input'
                                                ? !userInput.trim()
                                                : selectedOption === null)
                            }
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {currentQuestionIndex >= questions.length - 1 ? '🏁 Finish Quiz' : '➡️ Next Question'}
                        </button>
                        {/* Finish Quiz Button - Show when timer and questions are disabled or set to 0 */}
                        {(!settings.timerEnabled && (!settings.questionsEnabled || settings.numberOfQuestions === 0)) && (
                            <button
                                onClick={() => completeQuiz()}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                🏁 Finish Quiz
                            </button>
                        )}
                    </div>

                    {/* Challenge Mode Container - Bottom */}
                    {settings.challengeMode && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-t border-purple-200 dark:border-purple-700 mt-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">🏆 Challenge:</span>
                                    <span className="font-bold text-purple-800 dark:text-purple-300 text-sm">{settings.challengeMode}</span>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    📋 {getChallengeMode(settings.challengeMode)?.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
