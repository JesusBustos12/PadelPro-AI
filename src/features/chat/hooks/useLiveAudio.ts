import { useState, useRef, useCallback } from 'react';
import { AppLanguage, Message } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
// Convert http(s):// to ws(s):// for WebSocket. If empty (relative), use window.location
const WS_BASE = API_BASE 
    ? API_BASE.replace(/^http/, 'ws') 
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;


export const useLiveAudio = (
    language: AppLanguage,
    onNewMessage: (msg: Partial<Message>) => void
) => {
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null);
    const nextPlaybackTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

    const stopLiveAPI = useCallback(() => {
        activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        activeSourcesRef.current = [];
        nextPlaybackTimeRef.current = 0;
        if (sessionRef.current && typeof sessionRef.current.close === 'function') {
            try { sessionRef.current.close(); } catch (e) { console.error("Error closing session:", e); }
        }
        sessionRef.current = null;

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsLiveActive(false);
    }, []);

    const toggleLiveAPI = useCallback(async () => {
        if (isConnecting) return;

        if (isLiveActive) {
            stopLiveAPI();
            return;
        }

        setIsConnecting(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ctx = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = ctx;

            const ws = new WebSocket(`${WS_BASE}/api/live`);
            sessionRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'init', language }));
            };

            ws.onmessage = async (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'connected') {
                        setIsConnecting(false);
                        setIsLiveActive(true);

                        const source = ctx.createMediaStreamSource(stream);
                        const processor = ctx.createScriptProcessor(4096, 1, 1);
                        processorRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            if (ws.readyState !== WebSocket.OPEN) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                            }
                            const buffer = new Uint8Array(pcmData.buffer);
                            let binary = '';
                            for (let i = 0; i < buffer.byteLength; i++) {
                                binary += String.fromCharCode(buffer[i]);
                            }
                            const base64Data = btoa(binary);
                            ws.send(JSON.stringify({ type: 'audio', data: base64Data }));
                        };

                        source.connect(processor);
                        processor.connect(ctx.destination);
                        return;
                    }

                    if (message.type === 'error') {
                        console.error('WebSocket Error from Server:', message.message);
                        stopLiveAPI();
                        return;
                    }

                    // Otherwise it's a LiveServerMessage from Gemini
                    if (message.serverContent?.interrupted) {
                        activeSourcesRef.current.forEach(source => { try { source.stop(); } catch (e) { } });
                        activeSourcesRef.current = [];
                        nextPlaybackTimeRef.current = 0;
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && audioContextRef.current) {
                        const binaryString = atob(base64Audio);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

                        const pcm16 = new Int16Array(bytes.buffer);
                        const audioBuffer = audioContextRef.current.createBuffer(1, pcm16.length, 24000);
                        const channelData = audioBuffer.getChannelData(0);
                        for (let i = 0; i < pcm16.length; i++) channelData[i] = pcm16[i] / 0x7FFF;

                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(audioContextRef.current.destination);

                        const currentTime = audioContextRef.current.currentTime;
                        if (nextPlaybackTimeRef.current < currentTime) nextPlaybackTimeRef.current = currentTime;

                        source.start(nextPlaybackTimeRef.current);
                        nextPlaybackTimeRef.current += audioBuffer.duration;
                        activeSourcesRef.current.push(source);
                        source.onended = () => {
                            activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                        };
                    }

                    const inputText = message.serverContent?.inputTranscription?.text;
                    if (inputText) onNewMessage({ role: 'user', text: inputText, isLive: true });

                    const outputText = message.serverContent?.outputTranscription?.text;
                    if (outputText) onNewMessage({ role: 'model', text: outputText, isLive: true });

                } catch (e) {
                    console.error('Error parsing WebSocket message', e);
                }
            };

            ws.onclose = () => {
                setIsConnecting(false);
                stopLiveAPI();
            };

            ws.onerror = (err) => {
                console.error("WebSocket Connection Error:", err);
                setIsConnecting(false);
                stopLiveAPI();
            };

        } catch (err) {
            console.error("Error starting Live API:", err);
            setIsConnecting(false);
            stopLiveAPI();
            alert(language === 'es' ? 'No se pudo acceder al micrófono o conectar.' : 'Could not access microphone or connect.');
        }
    }, [isLiveActive, isConnecting, language, onNewMessage, stopLiveAPI]);

    return { isLiveActive, isConnecting, toggleLiveAPI };
};
