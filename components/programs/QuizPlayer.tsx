import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, HelpCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

interface QuizPlayerProps {
    quizJsonStr: string;
    onComplete: () => void;
}

export default function QuizPlayer({ quizJsonStr, onComplete }: QuizPlayerProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [parseError, setParseError] = useState(false);

    useEffect(() => {
        try {
            const parsed = JSON.parse(quizJsonStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setQuestions(parsed);
                setParseError(false);
            } else {
                setParseError(true);
            }
        } catch (e) {
            setParseError(true);
        }
        
        // Reset state on new quiz
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    }, [quizJsonStr]);

    if (parseError) {
        return (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                <HelpCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="text-red-700 font-bold mb-1">Invalid Quiz Data</h3>
                <p className="text-red-500 text-sm">The quiz JSON format is invalid. Please contact the administrator.</p>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQ = questions[currentIndex];
    const progress = Math.round((currentIndex / questions.length) * 100);

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        
        if (index === currentQ.correctAnswerIndex) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            onComplete();
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 70;
        
        return (
            <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                </div>
                <h2 className="text-3xl font-extrabold text-[#0B2545] mb-2">Quiz Completed!</h2>
                <p className="text-gray-500 font-medium mb-6">You scored {score} out of {questions.length} ({percentage}%)</p>
                
                {passed ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-100 max-w-md mx-auto">
                        Excellent work! You have successfully passed this quiz.
                    </div>
                ) : (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-100 max-w-md mx-auto mb-6">
                        You didn't quite hit the passing mark. Keep studying and try again!
                    </div>
                )}
                
                {!passed && (
                    <button 
                        onClick={handleRetry}
                        className="mt-4 px-6 py-3 bg-[#0B2545] text-white rounded-xl font-bold flex items-center justify-center mx-auto hover:bg-[#0B2545]/90 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-[#D4AF37]">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#D4AF37] transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-xl md:text-2xl font-bold text-[#0B2545] mb-6 leading-relaxed">
                        {currentQ.question}
                    </h3>
                    
                    <div className="space-y-3">
                        {currentQ.options.map((opt, i) => {
                            const isSelected = selectedOption === i;
                            const isCorrect = i === currentQ.correctAnswerIndex;
                            const showCorrectness = isAnswered;
                            
                            let btnClass = "border-gray-200 hover:border-[#D4AF37] text-gray-700 bg-white";
                            let icon = null;
                            
                            if (showCorrectness) {
                                if (isCorrect) {
                                    btnClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                                    icon = <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
                                } else if (isSelected && !isCorrect) {
                                    btnClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                                    icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                                } else {
                                    btnClass = "border-gray-100 bg-gray-50 text-gray-400 opacity-50";
                                }
                            } else if (isSelected) {
                                btnClass = "border-[#D4AF37] bg-[#D4AF37]/5 text-[#0B2545] ring-1 ring-[#D4AF37]";
                            }
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleOptionSelect(i)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left font-medium ${btnClass} ${!isAnswered ? 'hover:shadow-md' : 'cursor-default'}`}
                                >
                                    <span className="pr-4">{opt}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Explanation */}
                    {isAnswered && currentQ.explanation && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-start"
                        >
                            <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 leading-relaxed">
                                <span className="font-bold mr-1">Explanation:</span> 
                                {currentQ.explanation}
                            </p>
                        </motion.div>
                    )}
                    
                    {/* Next Action */}
                    {isAnswered && (
                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={handleNext}
                                className="px-8 py-3 bg-[#0B2545] hover:bg-[#15345a] text-white rounded-xl font-bold flex items-center shadow-lg transition-transform hover:translate-x-1"
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            
        </div>
    );
}
