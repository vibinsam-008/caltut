import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Play,
  RotateCw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
}

interface LiveVoiceControllerProps {
  currentTopic: string;
  onStudentSpeech: (transcript: string) => void;
  lastTutorExplanation?: string;
  className?: string;
}

// Check Web Speech API availability
const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition
    : null;

export const LiveVoiceController: React.FC<LiveVoiceControllerProps> = ({
  currentTopic,
  onStudentSpeech,
  lastTutorExplanation,
  className = '',
}) => {
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<VoiceMessage[]>([
    {
      id: 'vm-welcome',
      sender: 'tutor',
      text: `Hello! I am your MIT Engineering Calculus Tutor. You can speak with me naturally or type below as we study ${currentTopic}.`,
      timestamp: '00:01',
    },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak when tutor explanation changes and voice is active
  useEffect(() => {
    if (isVoiceActive && lastTutorExplanation && synthRef.current) {
      speakText(lastTutorExplanation);
    }
  }, [lastTutorExplanation]);

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    // Clean LaTeX for natural speech
    const cleanSpeech = text
      .replace(/\$\$([\s\S]*?)\$\$/g, ' mathematical equation ')
      .replace(/\$([^\$]+?)\$/g, ' $1 ')
      .replace(/\\int/g, ' integral of ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, ' $1 over $2 ')
      .replace(/\\sqrt\{([^}]+)\}/g, ' square root of $1 ')
      .replace(/\\lambda/g, ' lambda ')
      .replace(/\\theta/g, ' theta ')
      .replace(/\\pi/g, ' pi ')
      .replace(/\^2/g, ' squared ')
      .replace(/\^3/g, ' cubed ')
      .replace(/\\le|\\le/g, ' less than or equal to ')
      .replace(/\\ge|\\ge/g, ' greater than or equal to ')
      .replace(/[*#]/g, '');

    synthRef.current.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Restart listening if voice session is active
      if (isVoiceActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // already listening
        }
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);

    setTranscripts((prev) => [
      ...prev,
      {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: text.slice(0, 180) + (text.length > 180 ? '...' : ''),
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ]);
  };

  const startVoiceSession = () => {
    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API is not supported in this browser. You can use full text mode.');
      setIsVoiceActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim();

        if (transcript) {
          setTranscripts((prev) => [
            ...prev,
            {
              id: `user-${Date.now()}`,
              sender: 'student',
              text: transcript,
              timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
            },
          ]);
          onStudentSpeech(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isVoiceActive && !isSpeaking) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsVoiceActive(true);
      speakText(`Voice mode active. I am listening for your questions regarding ${currentTopic}.`);
    } catch (err: unknown) {
      setErrorMsg('Microphone access denied or unconfigured. Falling back to text mode.');
      setIsVoiceActive(false);
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceActive(false);
    setIsListening(false);
    setIsSpeaking(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const interruptSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3 ${className}`}
    >
      {/* Voice Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isVoiceActive
                ? isSpeaking
                  ? 'bg-amber-400 animate-ping'
                  : isListening
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-indigo-400'
                : 'bg-slate-600'
            }`}
          />
          <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <span>Mode E: Live Voice Tutor</span>
            {isVoiceActive && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {isSpeaking ? 'Tutor Speaking...' : isListening ? 'Listening...' : 'Connected'}
              </span>
            )}
          </span>
        </div>

        {/* Start / Stop Button */}
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={interruptSpeech}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-medium transition-colors"
              title="Interrupt current explanation"
            >
              <Square className="w-3 h-3" />
              <span>Interrupt</span>
            </button>
          )}

          {!isVoiceActive ? (
            <button
              onClick={startVoiceSession}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Voice Session</span>
            </button>
          ) : (
            <button
              onClick={stopVoiceSession}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span>End Voice Session</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded-md p-2">
          {errorMsg}
        </div>
      )}

      {/* Voice Transcript Feed */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-2 text-xs">
        {transcripts.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'student' ? 'justify-end text-right' : 'justify-start text-left'
            }`}
          >
            {msg.sender === 'tutor' && (
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white flex-shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`p-2 rounded-lg max-w-[85%] ${
                msg.sender === 'student'
                  ? 'bg-indigo-900/60 text-indigo-100 border border-indigo-700/60'
                  : 'bg-slate-800/70 text-slate-200 border border-slate-700/60'
              }`}
            >
              <p className="leading-snug">{msg.text}</p>
              <span className="text-[9px] text-slate-400 mt-1 block">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>Low-latency speech recognition with synchronized mathematical whiteboard.</span>
        <span className="text-indigo-400">Context: {currentTopic}</span>
      </div>
    </div>
  );
};
