import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function InterviewRoom() {
  const [status, setStatus] = useState('CONNECTING');
  const [messages, setMessages] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const wsRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const pingIntervalRef = useRef(null);

  useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
    }

    const connectWebSocket = () => {
        // Append token to URL
        const wsUrl = `ws://localhost:8000/ws/interview?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log('WS Connected');
            setStatus('READY');
            
            // Start Heartbeat
            pingIntervalRef.current = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'PING' }));
                }
            }, 30000); // 30s

            // Send Init
            wsRef.current.send(JSON.stringify({
                type: 'START_INTERVIEW',
                payload: { name: user?.name || 'Candidate', role: 'Python Dev' }
            }));
        };

        wsRef.current.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                const audioUrl = URL.createObjectURL(event.data);
                const audio = new Audio(audioUrl);
                setStatus('SPEAKING');
                audio.play();
                audio.onended = () => setStatus('LISTENING');
            } else {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'PONG') return;
                    
                    if (data.type === 'AI_RESPONSE') {
                        addMessage('AI', data.text);
                    } else if (data.type === 'STATE_CHANGE') {
                        if (data.state === 'THINKING') setStatus('THINKING');
                    } else if (data.type === 'INTERVIEW_END') {
                        alert('Interview Finished!');
                        navigate('/dashboard');
                    }
                } catch (e) {
                    // console.error(e);
                }
            }
        };

        wsRef.current.onclose = () => {
            console.log('WS Closed, attempting reconnect...');
            setStatus('CONNECTING');
            clearInterval(pingIntervalRef.current);
            // Simple reconnect logic (exponential backoff could be better)
            setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (err) => {
            console.error('WS Error', err);
            wsRef.current.close();
        };
    };

    connectWebSocket();

    // Initialize Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        
        // Setup Audio Recorder
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN && status === 'LISTENING') {
            wsRef.current.send(e.data);
          }
        };
        mediaRecorder.start(1000);

        // Setup Video Frame Analysis (Observer)
        // Capture frame every 1s
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        
        const frameInterval = setInterval(async () => {
            if (status === 'LISTENING' || status === 'SPEAKING' || status === 'THINKING') {
                try {
                    // Draw video to canvas to get base64
                    if (!canvasRef.current || !videoRef.current) return;
                    
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    
                    const base64Frame = canvasRef.current.toDataURL('image/jpeg', 0.5); // Low quality for speed
                    
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'VIDEO_FRAME',
                            payload: base64Frame
                        }));
                    }
                } catch (e) {
                    console.error("Frame capture error", e);
                }
            }
        }, 1000); // 1 FPS for risk control

        return () => clearInterval(frameInterval);
      });

    return () => {
      wsRef.current?.close();
      mediaRecorderRef.current?.stop();
      clearInterval(pingIntervalRef.current);
    };
  }, [token, navigate, user]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  
  const handleEndCall = () => {
    wsRef.current?.close();
    navigate('/dashboard');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 animate-fade-in">
      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoOn && 'hidden'}`} 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <VideoOff className="w-16 h-16" />
            </div>
          )}
          
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2 border border-white/10">
            <div className={`w-2.5 h-2.5 rounded-full ${
              status === 'SPEAKING' ? 'bg-green-500 animate-pulse' :
              status === 'THINKING' ? 'bg-yellow-500 animate-bounce' :
              status === 'LISTENING' ? 'bg-blue-500' : 
              status === 'CONNECTING' ? 'bg-red-500' : 'bg-slate-500'
            }`} />
            {status === 'SPEAKING' && "面试官说话中..."}
            {status === 'THINKING' && "思考中..."}
            {status === 'LISTENING' && "请说话..."}
            {status === 'READY' && "准备就绪"}
            {status === 'CONNECTING' && "连接中..."}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button 
              onClick={toggleMic}
              className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500 text-white'}`}
            >
              {isMicOn ? <Mic /> : <MicOff />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500 text-white'}`}
            >
              {isVideoOn ? <Video /> : <VideoOff />}
            </button>
            <button 
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-105 shadow-lg shadow-red-600/30"
            >
              <PhoneOff />
            </button>
          </div>
        </div>
      </div>

      <Card className="w-full md:w-96 flex flex-col h-[400px] md:h-auto bg-white/90">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-800">对话记录</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10">对话将显示在这里...</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === 'AI' 
                  ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                  : 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-600/20'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
