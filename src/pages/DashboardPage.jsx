// src/pages/DashboardPage.jsx
/**
 * @fileoverview Dashboard Page.
 * Rendered at route: `/dashboard`.
 * On mount, loads the user from local storage and fetches their health profile from the backend.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Brain, Activity, Heart, Zap, Droplets, Footprints, Paperclip } from 'lucide-react';
import { colors, gradients } from '../theme/colors';
import { API_BASE_URL } from '../api/client';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const messagesEndRef = useRef(null);

  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? (() => {
    try { return JSON.parse(storedUser); } catch { return null; }
  })() : null;

  const userId = user ? user.id : null;

  // PROACTIVE FIX: Redirect if user ID is missing (corrupt state)
  useEffect(() => {
    if (storedUser && !userId) {
      console.warn("User ID missing. Redirecting to login to refresh session.");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, [userId, storedUser]);

  // PROFILE STATE
  const [userProfile, setUserProfile] = useState(null);

  // Fetch profile from backend
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile/get?user_id=${userId}`);
        const data = await res.json();

        if (data.profile) {
          setUserProfile(data.profile);

          // Optional: store locally
          localStorage.setItem("user_profile", JSON.stringify(data.profile));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [userId]);

  const location = useLocation();

  // ---------------------------------------
  // CHAT SYSTEM STATES
  // ---------------------------------------
  const [messages, setMessages] = useState(() => {
    if (location.state?.initialMessages) {
      return location.state.initialMessages;
    }
    return [
      {
        id: 1,
        role: 'assistant',
        text: user?.name
          ? `Hello ${user.name}! I'm your Wellness Assistant. I've analyzed your health profile and I'm ready to provide personalized advice. How can I help you today?`
          : "Hello! I'm your Wellness Assistant. I've analyzed your health profile and I'm ready to provide personalized advice. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentsUsed, setAgentsUsed] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]); // Array of {agent, text}

  // -------- HEALTH CALCULATIONS --------
  const calculateBMI = () => {
    if (!userProfile?.weight_kg || !userProfile?.height_cm) return null;
    const heightM = userProfile.height_cm / 100;
    const bmi = (userProfile.weight_kg / (heightM * heightM)).toFixed(1);
    return parseFloat(bmi);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#f59e0b' };
    if (bmi < 25) return { category: 'Normal', color: '#10b981' };
    if (bmi < 30) return { category: 'Overweight', color: '#f59e0b' };
    return { category: 'Obese', color: '#ef4444' };
  };

  const calculateWaterGoal = () => {
    if (!userProfile?.weight_kg) return '2.5L';
    let baseWater = userProfile.weight_kg * 0.033;
    if (userProfile.activity_level === 'medium') baseWater *= 1.2;
    if (userProfile.activity_level === 'high') baseWater *= 1.5;
    return `${baseWater.toFixed(1)}L`;
  };

  const calculateStepsGoal = () => {
    if (!userProfile?.activity_level) return '8,000 steps';
    switch (userProfile.activity_level) {
      case 'low': return '5,000 steps';
      case 'medium': return '8,000 steps';
      case 'high': return '12,000 steps';
      default: return '8,000 steps';
    }
  };

  const calculateSleepTarget = () => {
    if (!userProfile?.age) return '7-8 hours';
    const age = userProfile.age;
    if (age < 18) return '8-10 hours';
    if (age < 65) return '7-9 hours';
    return '7-8 hours';
  };

  // CALCULATED VALUES
  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : { category: '--', color: colors.neutral[400] };
  const waterGoal = calculateWaterGoal();
  const stepsGoal = calculateStepsGoal();
  const sleepTarget = calculateSleepTarget();

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Safe JSON
  const readJsonSafe = async (res) => {
    try { return await res.json(); } catch { return null; }
  };

  // File Upload State & Handling
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // More robust PDF check (MIME type OR extension)
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExt) {
      alert('Only PDF files are allowed based on file type.');
      return;
    }
    setAttachedFile(file);
    // Reset input value so same file can be selected again if cleared
    e.target.value = null;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const res = await fetch(`${API_BASE_URL}/upload/report`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  };

  // Chat sending via WebSocket
  const handleSend = async () => {
    let trimmed = input.trim();
    if (!trimmed && !attachedFile) return;
    if (!trimmed && attachedFile) trimmed = "Please analyze my uploaded medical report.";

    if (loading) return;

    setError('');
    setAgentLogs([]); // Clear previous logs
    setAgentsUsed([]);

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1. Upload File if attached
      if (attachedFile) {
        setAgentLogs([{ agent: 'System', text: `Uploading ${attachedFile.name}...` }]);
        try {
          const uploadRes = await uploadFile(attachedFile);

          // Add visual confirmation to chat
          const systemMsg = {
            id: Date.now(),
            role: 'assistant',
            text: `**File Uploaded**: ${attachedFile.name} (${uploadRes.extracted_length || 0} chars analyzed).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, systemMsg]);

          setAttachedFile(null); // Clear after success
        } catch (uploadErr) {
          console.error(uploadErr);
          setError("Failed to upload report. Please try again.");
          setLoading(false);
          return;
        }
      }

      // 2. Connect to WebSocket
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/process-query`;
      const fullWsUrl = `${wsProtocol}://${wsUrl}`;

      const ws = new WebSocket(fullWsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          query: trimmed,
          user_id: String(userId) // Ensure it's a string for backend compatibility
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'agent') {
          setAgentLogs(prev => [...prev, { agent: data.agent, text: data.text }]);
        } else if (data.type === 'final') {
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            text: data.answer || "I'm here to help!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reasoning_logs: data.reasoning_logs || agentLogs
          };
          setMessages(prev => [...prev, assistantMessage]);
          if (data.agents_used) setAgentsUsed(data.agents_used);
          setLoading(false);
          ws.close();
        } else if (data.type === 'error') {
          setError(data.text);
          setLoading(false);
          ws.close();
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error", e);
        setError("Connection error");
        setLoading(false);
      };

      ws.onclose = (event) => {
        if (loading) {
          // If closed unexpectedly without finishing, reset state
          console.warn("WebSocket closed unexpectedly", event);
          setLoading(false);
          // Only set error if we didn't get a proper close or error message before
          if (!error && !event.wasClean) {
            setError("Connection lost. Please try again.");
          }
        }
      };

    } catch (err) {
      setError(err.message || "Network error");
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column', // Mobile default (stack)
      gap: '1.5rem',
      flex: 1, // Let it fill available space
      boxSizing: 'border-box'
    }}>

      {/* HEADER */}
      <div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          background: 'linear-gradient(to right, #ffffff, #93c5fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Wellness Dashboard
        </h1>

        <p style={{ color: colors.neutral[400] }}>
          {user?.name ? `Welcome back, ${user.name}` : 'Welcome to your wellness dashboard'}
        </p>
      </div>

      {/* HEALTH SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
      }}>



        {/* WATER */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Droplets size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Daily Water Goal</p>
            <p style={{ fontSize: '1.25rem', color: 'white' }}>{waterGoal}</p>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Based on weight</p>
          </div>
        </div>

        {/* STEPS */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f7971e, #ffd200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Footprints size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Daily Steps Goal</p>
            <p style={{ fontSize: '1.25rem', color: 'white' }}>{stepsGoal}</p>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Based on activity</p>
          </div>
        </div>

        {/* SLEEP */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Sleep Target</p>
            <p style={{ fontSize: '1.25rem', color: 'white' }}>{sleepTarget}</p>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[400] }}>Based on age</p>
          </div>
        </div>

      </div>

      {/* CHAT SYSTEM (UNCHANGED) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={24} color="white" />
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.25rem' }}>Wellness Assistant</h2>
          </div>
        </div>

        {/* CHAT BOX */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '20px',
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '300px' // Ensure minimum height on mobile
        }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginBottom: '1rem',
            }}>
              <div style={{
                display: 'inline-block',
                padding: '1rem',
                borderRadius: '12px',
                background: msg.role === 'user'
                  ? 'rgba(59,130,246,0.25)'
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                maxWidth: '80%',
              }}>
                <div style={{ lineHeight: '1.6' }}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        h3: ({ node, ...props }) => <h3 style={{ color: '#93c5fd', marginTop: '1.25rem', marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }} {...props} />,
                        ul: ({ node, ...props }) => <ul style={{ marginBottom: '1rem', paddingLeft: '1rem' }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                        p: ({ node, ...props }) => <p style={{ marginBottom: '0.75rem' }} {...props} />,
                        strong: ({ node, ...props }) => <strong style={{ color: '#bfdbfe', fontWeight: 'bold' }} {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  )}
                </div>

                {/* Reasoning Logs Display (After completion) */}
                {msg.reasoning_logs && msg.reasoning_logs.length > 0 && (
                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#60a5fa', userSelect: 'none', fontWeight: '500' }}>
                        View Reasoning Process
                      </summary>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {msg.reasoning_logs.map((log, i) => {
                          const icons = {
                            "SymptomAgent": "🔍",
                            "DietAgent": "🥗",
                            "LifestyleAgent": "🌙",
                            "FitnessAgent": "💪",
                            "Synthesizer": "🧠",
                            "Supervisor": "🤖",
                            "System": "⚙️"
                          };
                          const icon = icons[log.agent] || "📄";
                          return (
                            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <span>{icon}</span>
                              <div>
                                <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>{log.agent}</span>
                                <span style={{ marginLeft: '6px' }}>{log.message}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AGENT REASONING LOGS */}
          {loading && agentLogs.length > 0 && (
            <div style={{
              textAlign: 'left',
              marginBottom: '1rem',
              animation: 'fadeIn 0.5s',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                maxWidth: '80%',
                display: 'inline-block'
              }}>
                {agentLogs.map((log, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: colors.neutral[300]
                  }}>
                    <Sparkles size={14} color={gradients.primary} />
                    <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{log.agent}:</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Activity size={14} className="animate-spin" />
                  <span style={{ fontSize: '0.8rem', color: colors.neutral[400] }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ATTACHMENT PREVIEW - MOVED ABOVE INPUT AS A BLOCK */}
        {attachedFile && (
          <div style={{
            marginBottom: '0.5rem',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            color: '#93c5fd',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            alignSelf: 'flex-start'
          }}>
            <Paperclip size={16} />
            <span style={{ fontWeight: '500' }}>{attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              style={{
                marginLeft: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* INPUT */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={attachedFile ? "Ask about this report..." : "Ask anything about your health..."}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            // accept=".pdf" // Relaxed check is handled in JS
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: attachedFile ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)',
              color: attachedFile ? '#93c5fd' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: attachedFile ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}
            title="Upload Medical Report (PDF)"
          >
            <Paperclip size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachedFile}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              background: gradients.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Send size={20} /> Send
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: '1rem',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.5)', // Darker background
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px',
      }}>
        <p style={{ color: colors.neutral[400], fontSize: '0.8rem' }}>
          FitAura AI provides wellness suggestions. Always consult a medical professional.
        </p>
      </div>

    </div>
  );
};

export default DashboardPage;
