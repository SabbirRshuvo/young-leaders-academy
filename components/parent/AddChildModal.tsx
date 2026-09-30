"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserRound, Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type AddChildModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
    const t = useTranslations("Parent");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/parent/children", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ studentEmail: email.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send request");
            }

            setSuccess(true);
            toast.success("Connection request sent successfully!");
            
            setTimeout(() => {
                onSuccess();
                onClose();
                // Reset state
                setTimeout(() => {
                    setSuccess(false);
                    setEmail("");
                }, 300);
            }, 2000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div 
                className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-xl font-bold text-[#0B2545]">
                        Add Your Child
                    </h2>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0B2545]">Request Sent!</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Your connection request has been sent successfully. Waiting for student approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Enter your child&apos;s email address associated with their Young Leaders Academy account to send a connection request.
                            </p>

                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Student Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="studentEmail"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="student@example.com"
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-[#D4AF37] focus:bg-white focus:ring-1 focus:ring-[#D4AF37]"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-semibold text-white transition-all hover:bg-[#0B2545]/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                                    disabled={loading || !email.trim()}
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Send Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
