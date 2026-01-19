import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function InterviewRoom() {
  const [step, setStep] = useState('CHECK'); // CHECK | ROOM
  const [status, setStatus] = useState('CONNECTING');
  const [messages, setMessages] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const wsRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null); // For pre-flight check
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Pre-flight check effect
  useEffect(() => {
    if (step === 'CHECK') {
      startCameraPreview();
    }
    return () => {
      // Cleanup stream when unmounting or switching to ROOM (room handles its own stream)
      if (step === 'CHECK' && streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const startCameraPreview = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media Error:", err);
      setPermissionError("无法访问摄像头或麦克风。请检查设备权限设置。");
    }
  };

  const joinInterview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop()); // Stop preview stream
    }
    setStep('ROOM');
  };

  // Main Interview Logic
  useEffect(() => {
    if (step !== 'ROOM') return;
    if (!token) {
        navigate('/login');
        return;
    }

    const connectWebSocket = () => {
        const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${wsBaseUrl}/ws/interview?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log('WS Connected');
            setStatus('READY');
            
            pingIntervalRef.current = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'PING' }));
                }
            }, 30000);

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
                        alert('面试已结束');
                        navigate('/dashboard');
                    }
                } catch (e) {
                    // console.error(e);
                }
            }
        };

        wsRef.current.onclose = () => {
            console.log('WS Closed');
            setStatus('CONNECTING');
            clearInterval(pingIntervalRef.current);
        };
    };

    connectWebSocket();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream; // Keep ref to stop later
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN && status === 'LISTENING') {
            wsRef.current.send(e.data);
          }
        };
        mediaRecorder.start(1000);

        const videoTrack = stream.getVideoTracks()[0];
        
        const frameInterval = setInterval(async () => {
            if (status === 'LISTENING' || status === 'SPEAKING' || status === 'THINKING') {
                try {
                    if (!canvasRef.current || !videoRef.current) return;
                    
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    
                    const base64Frame = canvasRef.current.toDataURL('image/jpeg', 0.5);
                    
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
        }, 1000);

        return () => clearInterval(frameInterval);
      })
      .catch(err => {
        console.error("Room Media Error:", err);
        setPermissionError("面试中途设备连接断开，请刷新页面重试。");
      });

    return () => {
      wsRef.current?.close();
      mediaRecorderRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      clearInterval(pingIntervalRef.current);
    };
  }, [step, token, navigate, user]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };
  
  const handleEndCall = () => {
    wsRef.current?.close();
    navigate('/dashboard');
  };

  if (step === 'CHECK') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">设备检测</h1>
            <p className="text-slate-500 mt-2">在进入面试前，请确保您的摄像头和麦克风工作正常。</p>
          </div>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
            {permissionError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-50 p-6 text-center">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="font-bold">无法访问设备</p>
                <p className="text-sm mt-2">{permissionError}</p>
                <Button variant="outline" className="mt-6" onClick={startCameraPreview}>
                  重试
                </Button>
              </div>
            ) : (
              <video 
                ref={previewVideoRef} 
                autoPlay 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white text-sm flex items-center gap-2">
              {permissionError ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
              {permissionError ? "设备异常" : "设备正常"}
            </div>
          </div>

          <div className="flex justify-center gap-4">
             <Button variant="secondary" onClick={() => navigate('/dashboard')}>
               取消
             </Button>
             <Button 
               size="lg" 
               onClick={joinInterview} 
               disabled={!!permissionError}
               className="shadow-xl shadow-primary-500/20"
             >
               <Video className="w-5 h-5 mr-2" />
               加入面试
             </Button>
          </div>
        </Card>
      </div>
    );
  }

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
              onClick={toggleVideo}
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
