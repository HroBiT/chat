import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './chat.css';

const url_server = 'http://localhost:3001'
const socket = io(url_server); 

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        (async () => {
            const req = await fetch(url_server+'/messages', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (!req.ok) return

            const data = await req.json()
            const messages = data.map((message) => message.content)
            setMessages(messages)
        })()

        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        return () => {
            socket.off('message');
            socket.off('connect_error');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (input.trim()) {
            socket.emit('message', input, (error) => {
                if (error) {
                    console.error('Message send error:', error);
                }
            });
            setInput(''); 
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napisz wiadomość..."
                aria-label="Message input"
                className="message-input"
            />
            <button onClick={sendMessage} aria-label="Send message">Wyślij</button>
        </div>
    );
};

export default Chat;