// src/pages/HistoryPage.jsx
import React, { useState } from 'react';
import { History, Calendar, Clock, User, Bot, Trash2, MessageSquare, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../api/client';
import ReactMarkdown from 'react-markdown';

const HistoryPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  // Helper to toggle accordion
  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDelete = async (turnId, e) => {
    e.stopPropagation(); // prevent expanding
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const userId = JSON.parse(storedUser).id;

      const res = await fetch(`${API_BASE_URL}/history/${userId}/${turnId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      // Update UI
      setConversations(prev => prev.filter(c => c.id !== turnId));
    } catch (err) {
      alert("Failed to delete chat");
      console.error(err);
    }
  };

  const handleContinue = (e, conv) => {
    e.stopPropagation();
    // Reconstruct chat history for the dashboard
    const restoredMessages = [
      {
        id: 'hist-user-' + conv.id,
        role: 'user',
        text: conv.userMessage,
        timestamp: conv.time
      },
      {
        id: 'hist-asst-' + conv.id,
        role: 'assistant',
        text: conv.assistantResponse,
        timestamp: conv.time,
        reasoning_logs: conv.reasoning_logs
      }
    ];
    navigate('/dashboard', { state: { initialMessages: restoredMessages } });
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const userId = JSON.parse(storedUser).id;

        const res = await fetch(`${API_BASE_URL}/history/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch history');

        const data = await res.json();

        // Transform turns into UI structure
        const mapped = (data.turns || []).slice().reverse().map((turn) => {
          const dateObj = new Date(turn.timestamp);
          return {
            id: turn.id, // UUID from backend
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userMessage: turn.user_message,
            assistantResponse: turn.assistant_response,
            reasoning_logs: turn.reasoning_logs || []
          };
        });
        setConversations(mapped);
      } catch (err) {
        console.error(err);
        setError("Could not load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto',
      padding: '1rem',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <History size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
          }}>
            Conversation History
          </h1>
        </div>
        <p style={{
          color: colors.neutral[400],
          fontSize: '1.1rem',
        }}>
          Review, manage, or continue your past conversations
        </p>
      </div>

      {/* Conversations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {conversations.map((conv) => {
          const isExpanded = expandedId === conv.id;

          return (
            <div
              key={conv.id || Math.random()} // Fallback if ID invalid
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                borderColor: isExpanded ? colors.primary[500] : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleExpand(conv.id)}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, overflow: 'hidden' }}>
                  {/* Date/Time Badge */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    minWidth: '80px'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: colors.neutral[400] }}>{conv.date}</span>
                    <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>{conv.time}</span>
                  </div>

                  {/* Summary Snippet */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{
                      color: 'white',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.userMessage}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: colors.neutral[400] }}>
                      Click to view full chat
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isExpanded ? <ChevronUp size={20} color={colors.neutral[400]} /> : <ChevronDown size={20} color={colors.neutral[400]} />}
                </div>
              </div>

              {/* Accordion Body (Expanded) */}
              {isExpanded && (
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  padding: '1.5rem',
                  background: 'rgba(0,0,0,0.1)'
                }}>
                  {/* User Message Full */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <User size={16} color={colors.primary[400]} />
                      <span style={{ color: colors.primary[400], fontWeight: 'bold' }}>You</span>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', color: 'white' }}>
                      {conv.userMessage}
                    </div>
                  </div>

                  {/* Assistant Response */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Bot size={16} color={colors.secondary[400]} />
                      <span style={{ color: colors.secondary[400], fontWeight: 'bold' }}>Assistant</span>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: colors.neutral[200],
                      lineHeight: '1.6',
                    }}>
                      <ReactMarkdown
                        components={{
                          h3: ({ node, ...props }) => <h3 style={{ color: '#93c5fd', marginTop: '1rem', fontSize: '1.1rem' }} {...props} />,
                          li: ({ node, ...props }) => <li style={{ marginLeft: '1rem' }} {...props} />,
                          strong: ({ node, ...props }) => <strong style={{ color: '#bfdbfe' }} {...props} />
                        }}
                      >
                        {conv.assistantResponse}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    marginTop: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1rem'
                  }}>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      <Trash2 size={16} /> Delete Chat
                    </button>

                    <button
                      onClick={(e) => handleContinue(e, conv)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: colors.primary[600],
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: colors.neutral[500],
          }}>
            <History size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              No conversations yet
            </h3>
            <p>Start chatting with your Wellness Assistant to see history here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;