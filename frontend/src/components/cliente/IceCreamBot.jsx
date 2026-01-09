import React, { useState, useEffect, useRef } from 'react';
import '../../styles/cliente/IceCreamBot.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const IceCreamBot = ({ productos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "¡Hola! Soy tu Heladero Virtual. ¿En qué puedo ayudarte hoy?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const getImageUrl = (path) => {
        if (!path) return 'https://placehold.co/50';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    // Simple Intelligent Keyword Matching
    const processQuery = (query) => {
        const lowerQuery = query.toLowerCase();
        let response = { text: "Lo siento, no he entendido tu pregunta. ¿Puedes probar con 'sabores', 'chocolate' o 'alérgenos'?", products: [] };

        // 1. Greetings
        if (lowerQuery.match(/hola|buenos|buenas|hi|hello/)) {
            return { text: "¡Hola! ¿Buscas algún sabor en especial?", products: [] };
        }

        // 2. Logistics & Shipping (Priority over generic search)
        if (lowerQuery.match(/envio|casa|domicilio|llevais|reparto/)) {
            return {
                text: "Realizamos envíos a domicilio refrigerados para garantizar la calidad. El tiempo estimado es de 24-48h. ¡Gratis para pedidos superiores a 50€!",
                products: []
            };
        }

        if (lowerQuery.match(/recoger|tienda|fisica|ubicacion/)) {
            return {
                text: "¡Claro! Puedes hacer tu pedido aquí y recogerlo en cualquiera de nuestras tiendas sin coste adicional. Selecciona 'Recogida en Tienda' al finalizar tu compra.",
                products: []
            };
        }

        // 3. Professionals / B2B
        if (lowerQuery.match(/profesional|b2b|hosteleria|restaurante|empresa|proveedor/)) {
            return {
                text: "Tenemos un área exclusiva para profesionales con formatos y precios especiales para hostelería. Accede a 'Regma para Profesionales' en el menú superior o regístrate como empresa.",
                products: []
            };
        }

        // 4. Search by Flavor/Keyword
        const matchingProducts = productos.filter(p => {
            const name = (p.nombre + (p.variante?.nombre || '')).toLowerCase();
            const desc = (p.descripcion || '').toLowerCase();
            return name.includes(lowerQuery) || desc.includes(lowerQuery);
        });

        if (matchingProducts.length > 0) {
            // Group by unique variant name to satisfy diversity
            const unique = [];
            const seen = new Set();
            matchingProducts.forEach(p => {
                const name = p.variante?.nombre || p.nombre;
                if (!seen.has(name)) {
                    seen.add(name);
                    unique.push(p);
                }
            });

            return {
                text: `He encontrado ${unique.length} opciones deliciosas para "${query}":`,
                products: unique.slice(0, 3) // Limit results
            };
        }

        // 5. Fallbacks / Allergens
        if (lowerQuery.includes('gluten') || lowerQuery.includes('celiaco')) {
            return { text: "Por seguridad, te recomiendo consultar la ficha técnica detallada de cada producto. Muchos de nuestros helados son libres de gluten, pero el contaminado cruzado es posible en tienda.", products: [] };
        }
        if (lowerQuery.includes('precio') || lowerQuery.includes('cuanto cuesta')) {
            return { text: "Los precios varían según el formato. Puedes ver el precio exacto seleccionando el producto en el catálogo.", products: [] };
        }

        return response;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        // User Message
        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Bot Response (Simulated Delay)
        setTimeout(() => {
            const response = processQuery(userMsg.text);
            const botMsg = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                products: response.products
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleQuickReply = (text) => {
        setInput(text);
        const userMsg = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setTimeout(() => {
            const response = processQuery(text);
            const botMsg = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                products: response.products
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="ice-cream-bot-widget">
            {isOpen && (
                <div className="bot-window">
                    <div className="bot-header">
                        <div className="bot-title">
                            <h3>Heladero Virtual</h3>
                            <span>Siempre disponible</span>
                        </div>
                        <button className="bot-close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="bot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                                <div className={`message ${msg.sender}`}>
                                    {msg.text}
                                </div>
                                {msg.products && msg.products.length > 0 && (
                                    <div className="bot-recommendations">
                                        {msg.products.map(prod => (
                                            <div key={prod._id} className="chat-product-card" onClick={() => {
                                                // Ideally scroll to product
                                            }}>
                                                <img
                                                    src={getImageUrl(prod.variante?.imagen || prod.imagenPrincipal || prod.imagen)}
                                                    alt={prod.nombre}
                                                    className="chat-prod-img"
                                                />
                                                <div className="chat-prod-info">
                                                    <h4>{prod.variante?.nombre || prod.nombre}</h4>
                                                    <span>{(prod.precioFinal || prod.precioBase).toFixed(2)}€</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot typing">
                                <span>...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-replies">
                        {/* <button className="quick-chip" onClick={() => handleQuickReply('Chocolate')}>Chocolate</button> */}
                        <button className="quick-chip" onClick={() => handleQuickReply('Sin Gluten')}>Sin Gluten</button>
                        <button className="quick-chip" onClick={() => handleQuickReply('Envíos')}>Envíos</button>
                        <button className="quick-chip" onClick={() => handleQuickReply('Soy Profesional')}>Soy Profesional</button>
                    </div>

                    <div className="bot-input-area">
                        <input
                            type="text"
                            placeholder="Pregunta sobre sabores..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="bot-send-btn" onClick={handleSend} disabled={!input.trim()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <button className="bot-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <span className="bot-icon">×</span>
                ) : (
                    <span className="bot-icon">💬</span>
                )}
            </button>
        </div>
    );
};

export default IceCreamBot;
