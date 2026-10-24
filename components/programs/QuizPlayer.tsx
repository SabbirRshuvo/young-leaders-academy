import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, HelpCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuizQuestion {
    question?: string;
    question_text?: string;
    question_ar?: string;
    title?: string;
    prompt?: string;
    options?: (string | { text?: string; label?: string; value?: string; title?: string; isCorrect?: boolean; correct?: boolean })[];
    choices?: (string | { text?: string; label?: string; value?: string; title?: string; isCorrect?: boolean; correct?: boolean })[];
    answers?: (string | { text?: string; label?: string; value?: string; title?: string; isCorrect?: boolean; correct?: boolean })[];
    correctAnswerIndex?: number | string;
    correct_answer_index?: number | string;
    correctIndex?: number | string;
    correct_index?: number | string;
    correct_answer?: string | number;
    correctAnswer?: string | number;
    correct_option?: string | number;
    correctOption?: string | number;
    answer?: string | number;
    answer_index?: number | string;
    correct?: string | number | boolean;
    explanation?: string;
    explanation_ar?: string;
    [key: string]: any;
}

export interface QuizPlayerProps {
    quizJsonStr?: string;
    quizData?: any;
    onComplete: () => void;
}

/**
 * Clean and normalize a string by trimming, collapsing spaces, and lowercasing
 */
function cleanString(str: any): string {
    if (str === null || str === undefined) return '';
    return String(str).trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Extract display text from an option that could be a string, number, or object
 */
function getOptionText(opt: any): string {
    if (typeof opt === 'string') return opt;
    if (typeof opt === 'number') return String(opt);
    if (!opt) return '';
    return opt.text || opt.label || opt.title || opt.value || opt.option || String(opt);
}

/**
 * Evaluates whether a given option index / option value matches the correct answer
 * Handles:
 * 1. Explicit booleans on option objects (`opt.isCorrect: true`)
 * 2. 0-based integer index (`correctIndex: 0`, `correctAnswerIndex: 0`)
 * 3. 1-based integer index when out of 0-based range (`correctIndex: 3` for 3 options)
 * 4. Numeric strings (`correct_answer: "0"`, `"1"`)
 * 5. Letter options (`correct_answer: "A"`, `"B"`, `"C"`, `"D"`)
 * 6. Full string matching between option text and `correct_answer`, trimming whitespace and ignoring case
 * 7. Prefix-stripped string matching (e.g., "A) Option Text" vs "Option Text")
 */
function isAnswerCorrect(q: QuizQuestion, optionIndex: number, optionVal: any): boolean {
    if (!q) return false;

    // 1. Check if the option itself has an isCorrect/correct boolean flag
    if (typeof optionVal === 'object' && optionVal !== null) {
        if (optionVal.isCorrect === true || optionVal.correct === true) return true;
    }

    const optText = getOptionText(optionVal);
    const cleanedOptText = cleanString(optText);

    // Look for target correct answer across all supported schema key variations
    const target =
        q.correct_answer !== undefined ? q.correct_answer :
        q.correctAnswer !== undefined ? q.correctAnswer :
        q.correctIndex !== undefined ? q.correctIndex :
        q.correct_index !== undefined ? q.correct_index :
        q.correctAnswerIndex !== undefined ? q.correctAnswerIndex :
        q.correct_answer_index !== undefined ? q.correct_answer_index :
        q.correct_option !== undefined ? q.correct_option :
        q.correctOption !== undefined ? q.correctOption :
        q.answer !== undefined ? q.answer :
        q.answer_index !== undefined ? q.answer_index :
        q.correct;

    if (target === undefined || target === null) {
        return false;
    }

    const rawOptions = (q.options || q.choices || q.answers || []) as any[];

    // 2. Direct number comparison
    if (typeof target === 'number') {
        // Direct 0-based index match
        if (target === optionIndex) return true;
        // 1-based index fallback if out of bounds (e.g. index 3 for 3 options)
        if (target === optionIndex + 1 && target === rawOptions.length) {
            return true;
        }
    }

    // 3. String comparison
    const targetStr = String(target).trim();
    const cleanedTarget = cleanString(target);

    // A. Numeric string match ("0", "1", etc.)
    const parsedTargetIndex = parseInt(targetStr, 10);
    if (!isNaN(parsedTargetIndex) && String(parsedTargetIndex) === targetStr) {
        if (parsedTargetIndex === optionIndex) return true;
        if (parsedTargetIndex === optionIndex + 1 && parsedTargetIndex === rawOptions.length) {
            return true;
        }
    }

    // B. Letter match ("A" -> 0, "B" -> 1, "C" -> 2, "D" -> 3)
    if (/^[A-Za-z]$/.test(targetStr)) {
        const letterIndex = targetStr.toUpperCase().charCodeAt(0) - 65;
        if (letterIndex === optionIndex) return true;
    }

    // C. Clean text match against option text (case-insensitive & trimmed)
    if (cleanedTarget && cleanedOptText && cleanedTarget === cleanedOptText) {
        return true;
    }

    // D. Text match ignoring leading letter/number prefixes like "A) ", "A. ", "1. ", etc.
    const stripPrefix = (s: string) => s.replace(/^([a-z0-9]+[\.\)\:\-]\s*)+/i, '').trim();
    const strippedTarget = stripPrefix(cleanedTarget);
    const strippedOpt = stripPrefix(cleanedOptText);
    if (strippedTarget && strippedOpt && strippedTarget === strippedOpt) {
        return true;
    }

    return false;
}

export default function QuizPlayer({ quizJsonStr, quizData, onComplete }: QuizPlayerProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [parseError, setParseError] = useState(false);

    useEffect(() => {
        let rawList: any[] = [];
        let error = false;

        try {
            let data: any = quizData;
            if (!data && quizJsonStr) {
                let parsed = typeof quizJsonStr === 'string' ? JSON.parse(quizJsonStr) : quizJsonStr;
                // If double-stringified JSON, parse again
                if (typeof parsed === 'string') {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch (_) {}
                }
                data = parsed;
            }

            if (Array.isArray(data)) {
                rawList = data;
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.questions)) {
                    rawList = data.questions;
                } else if (Array.isArray(data.quiz)) {
                    rawList = data.quiz;
                } else if (Array.isArray(data.items)) {
                    rawList = data.items;
                } else {
                    error = true;
                }
            } else {
                error = true;
            }
        } catch (e) {
            console.error("Quiz parsing error:", e);
            error = true;
        }

        if (!error && rawList.length > 0) {
            setQuestions(rawList);
            setParseError(false);
        } else {
            setParseError(true);
        }

        // Reset state on new quiz
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    }, [quizJsonStr, quizData]);

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
    const rawOptions = (currentQ?.options || currentQ?.choices || currentQ?.answers || []) as any[];
    const progress = Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100);
    const questionPrompt = currentQ.question || currentQ.question_text || currentQ.title || currentQ.prompt || "Question";

    const handleSelectAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);

        const isCorrect = isAnswerCorrect(currentQ, index, rawOptions[index]);
        if (isCorrect) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            const percentage = Math.round((score / questions.length) * 100);
            if (percentage >= 70) {
                onComplete();
            }
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
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
                        You didn&apos;t quite hit the passing mark. Keep studying and try again!
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
                        {questionPrompt}
                    </h3>

                    <div className="space-y-3">
                        {rawOptions.map((opt: any, i: number) => {
                            const optText = getOptionText(opt);
                            const isSelected = selectedAnswer === i;
                            const isCorrect = isAnswerCorrect(currentQ, i, opt);
                            const showCorrectness = isAnswered;

                            let btnClass = "border-gray-200 hover:border-[#D4AF37] text-gray-700 bg-white";
                            let icon = null;

                            if (showCorrectness) {
                                if (isCorrect) {
                                    btnClass = "border-green-500 bg-green-50 text-green-800 ring-2 ring-green-500/20";
                                    icon = <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
                                } else if (isSelected && !isCorrect) {
                                    btnClass = "border-red-500 bg-red-50 text-red-800 ring-2 ring-red-500/20";
                                    icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                                } else {
                                    btnClass = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-50";
                                }
                            } else if (isSelected) {
                                btnClass = "border-[#D4AF37] bg-[#D4AF37]/5 text-[#0B2545] ring-1 ring-[#D4AF37]";
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelectAnswer(i)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left font-medium ${btnClass} ${!isAnswered ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
                                >
                                    <span className="pr-4">{optText}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {isAnswered && (currentQ.explanation || currentQ.explanation_ar) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-start"
                        >
                            <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 leading-relaxed">
                                <span className="font-bold mr-1">Explanation:</span>
                                {currentQ.explanation || currentQ.explanation_ar}
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
