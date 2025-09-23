
import { useState, useContext, useCallback, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";

import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";

// --- Chat Message Component ---
// Renders a single chat bubble, styled differently for the user and the AI.
const ChatMessage = ({ message, isUser }) => {
    const bubbleClass = isUser 
        ? "bg-blue-600 text-white self-end" 
        : "bg-slate-200 text-slate-800 self-start";
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: isUser ? 20 : -20 }}
            className={`w-fit max-w-xl rounded-2xl px-4 py-3 ${bubbleClass}`}
        >
            {/* Using react-markdown to properly render formatted AI responses */}
            <div className="prose prose-sm text-inherit">
                <Markdown>{message}</Markdown>
            </div>
        </motion.div>
    );
};

// --- Typing Indicator Component ---
// Shows a simple animation while waiting for the AI to respond.
const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="self-start flex items-center gap-2 bg-slate-200 text-slate-500 rounded-2xl px-4 py-3"
    >
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </motion.div>
);


const AiBusinessChat = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you analyze your business data today? Ask me about sales trends, top products, or customer behavior.", isUser: false }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Automatically scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim() || !branch || isLoading) return;

        const userMessage = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            // API call to the backend Gemini endpoint
            const response = await axiosSecure.post(`/prediction/${branch}/insights`, {
                prompt: currentInput
            });
            
            const aiMessage = { text: response.data.insight, isUser: false };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error fetching AI insight:", error);
            const errorMessage = { 
                text: "Sorry, I encountered an error while trying to respond. Please check the server or try again.", 
                isUser: false 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, axiosSecure, branch, isLoading]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200 flex flex-col h-screen">
            <Mtitle title="AI Restaurant Chat" />
            
            <motion.div 
                className="card bg-base-100 shadow-xl flex-grow flex flex-col mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Chat History */}
                <div className="card-body p-4 sm:p-6 flex-grow overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <ChatMessage key={index} message={msg.text} isUser={msg.isUser} />
                            ))}
                        </AnimatePresence>
                        {isLoading && <TypingIndicator />}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Form */}
                <div className="card-actions p-4 border-t border-slate-200 bg-base-100/80 backdrop-blur-sm">
                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Ask about sales, top products..."
                            className="input input-bordered w-full"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="btn bg-blue-600 hover:bg-blue-700 text-white btn-circle" 
                            disabled={isLoading || !input.trim()}
                        >
                            <FiSend className="text-xl" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AiBusinessChat;