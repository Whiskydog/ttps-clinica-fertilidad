"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { sendMessage, ChatbotMessage as ApiChatbotMessage, ChatbotPayload } from "../lib/services/chatbot";

interface LocalMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatbotWidgetProps {
    patientData?: {
        id: number;
        name: string;
        birthDate: string;
        gender: string;
    };
}

const GUEST_DATA = {
    id: 999,
    name: "Invitado",
    birthDate: "2000-01-01",
    gender: "O",
};

export default function ChatbotWidget({ patientData }: ChatbotWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userData = patientData || GUEST_DATA;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: LocalMessage = { role: "user", content: inputValue };
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInputValue("");
        setIsLoading(true);

        try {
            // Transform internal messages (simple format) to API format (Gemini format)
            const apiMessages = newHistory.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }));

            const payload: any = { // Using any cast to matching the updated service type if needed, or strictly typing it
                patientId: userData.id,
                patientName: userData.name,
                birthDate: userData.birthDate,
                gender: userData.gender,
                messages: apiMessages,
            };

            const response = await sendMessage(payload);

            // Assuming response is the string answer or an object with 'answer' or 'message'
            // Adjusting based on common external chatbot behaviors. 
            // If the service returns the full history, replace. If just the new message, push it.
            // Let's assume it returns { answer: "..." } or similar text.
            // If the external service returns a string directly:
            const answer = typeof response === 'string' ? response : (response.answer || response.message || JSON.stringify(response));

            const botMsg: LocalMessage = { role: "assistant", content: answer };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMsg: LocalMessage = {
                role: "assistant",
                content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente."
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Asistente Virtual</h3>
                                <p className="text-xs text-blue-100">
                                    {userData.id === 0 ? "Modo Invitado" : `Hola, ${userData.name}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
                                <Bot size={48} className="text-blue-200" />
                                <p className="text-sm">¡Hola! ¿En qué puedo ayudarte hoy?</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                        }`}
                                >
                                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="self-start flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Bot size={14} className="text-gray-700" />
                                </div>
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <input
                                type="text"
                                placeholder="Escribe tu consulta..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className={`p-2 rounded-full transition-colors ${inputValue.trim() && !isLoading
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            Las respuestas son generadas por IA y pueden no ser exactas.
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isOpen
                    ? "bg-gray-100 text-gray-600 rotate-90"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}
