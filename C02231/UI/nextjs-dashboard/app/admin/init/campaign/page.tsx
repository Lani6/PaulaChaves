'use client';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Link from 'next/link';
import '/app/ui/global.css';
import * as signalR from '@microsoft/signalr';
import { HubConnectionBuilder } from '@microsoft/signalr';

type Message = {
    id: number;
    update: string;
    timestamp: string; // Cambiado a string para mantener el formato ISO
};

const URL = process.env.NEXT_PUBLIC_API_URL;
if (!URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

const Campaigns: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [connection, setConnection] = useState(null);
    const maxChars = 5000;

    const isValidDate = (date: any): boolean => {
        return !isNaN(Date.parse(date));
    };

    const transformData = (data: any[]): Message[] => {
        return data.map(item => {
            const timestamp = isValidDate(item[2]) ? new Date(item[2]).toISOString() : new Date().toISOString();
            return {
                id: Number(item[0]),
                update: item[1],
                timestamp: timestamp
            };
        });
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${URL}/api/Campaign`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos de la API:', data);
                setMessages(transformData(data));
            } else {
                setErrorMessage('Error al obtener las campañas.');
            }
        } catch (error) {
            setErrorMessage('Error al obtener las campañas.');
            console.error('Error fetching messages:', error);
        }
    };
    useEffect(() => {
        fetchMessages();

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${URL}/campaignHub`)
            .withAutomaticReconnect()
            .build();

        newConnection.on("ReceiveCampaignUpdate", (updateString) => {
            try {
                let update;
                if (typeof updateString === 'string') {
                    const parts = updateString.split(',');
                    if (parts.length === 10) {
                        update = {
                            id: Number(parts[0]),
                            update: parts[1],
                            timestamp: isValidDate(parts[2]) ? new Date(parts[2]).toISOString() : new Date().toISOString()
                        };
                    } else {
                        throw new Error('Invalid string format');
                    }
                } else {
                    update = JSON.parse(updateString);
                    if ('id' in update && 'update' in update && 'timestamp' in update) {
                        update.timestamp = isValidDate(update.timestamp) ? new Date(update.timestamp).toISOString() : new Date().toISOString();
                    } else {
                        throw new Error('Received update does not have the expected structure');
                    }
                }
                setMessages(prevMessages => [update, ...prevMessages.slice(0, 2)]);
            } catch (error) {
                console.error('Error processing update:', error);
            }
        });

        newConnection.start()
            .then(() => console.log('Connected to the campaign hub'))
            .catch(err => console.error('Error connecting to campaign hub:', err));

        return () => {
            newConnection.stop();
        };
    }, []);


    const handleAddMessage = async () => {
        try {
            const timestamp = new Date().toISOString(); // Obtener timestamp en UTC
            const response = await fetch(`${URL}/api/Campaign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: 0,
                    update: newMessage,
                    timestamp: timestamp // Enviar el timestamp
                })
            });

            if (response.ok) {
                setNewMessage('');
                await fetchMessages(); // Refrescar la lista después de enviar el mensaje
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('There was an error posting the message!', error);
        }
    };

    const handleDeleteMessage = async (id: number) => {
        try {
            const response = await fetch(`${URL}/api/Campaign/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setMessages(messages.filter(message => message.id !== id));
        } catch (error) {
            console.error("There was an error deleting the message!", error);
        }
    };
    /* const handleDeleteMessage = async (id) => {
         if (connection) {
             try {
                 await connection.invoke('DeleteMessage', id);
             } catch (error) {
                 console.error('Error deleting message:', error);
             }
         }
     };*/

    return (
        <div>
            <header className="p-3 text-bg-dark">
                <div className="row" style={{ color: 'gray' }}>
                    <div className="col-sm-12 d-flex justify-content-end align-items-center">
                        <Link href="/admin/init">
                            <button className="btn btn-dark">GO Back</button>
                        </Link>
                    </div>
                </div>
            </header>
            <div className='container'>
                <div className="col-md-12">
                    <div className="content">
                        <h2>Campaign Messages</h2>
                        {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
                        <div className="mb-3">
                            <textarea
                                className="form-control"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Enter new message (max 5000 characters)"
                                maxLength={maxChars}
                            />
                            <button className="btn btn-success mt-2" onClick={handleAddMessage}>Add Message</button>
                        </div>
                        <ul className="list-group">
                            {messages.map((message) => (
                                <li key={message.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{new Date(message.timestamp).toLocaleString()}:</strong> <span dangerouslySetInnerHTML={{ __html: message.update }} />
                                    </div>
                                    <button className="btn btn-danger" onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <footer className="footer" style={{ position: 'fixed', bottom: '0', width: '100%', zIndex: '9999' }}>
                <div className="text-center p-3">
                    <h5 className="text-light">Biblioteca de Paula</h5>
                </div>
            </footer>
        </div>
    );
};

export default Campaigns;
