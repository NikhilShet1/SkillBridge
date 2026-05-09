import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';

export default function MessagePanel({ gig, onClose }) {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages for this gig
    const channel = supabase
      .channel(`messages:${gig.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `gig_id=eq.${gig.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gig.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('gig_id', gig.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      gig_id: gig.id,
      sender_id: profile.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm">
      <div className="glass-panel w-full sm:max-w-md h-full sm:h-[600px] sm:rounded-2xl flex flex-col border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{gig.other?.name || 'Chat'}</h2>
              <p className="text-xs text-white/50">{gig.service?.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Say hi to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === profile.id;
              return (
                <div
                  key={msg.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? 'bg-green-500/20 text-green-50 self-end rounded-br-sm border border-green-500/20'
                      : 'bg-white/10 text-white self-start rounded-bl-sm border border-white/5'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 ${isMine ? 'text-green-400/50' : 'text-white/30'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 input-field resize-none max-h-32 min-h-[44px] py-3 text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg flex-shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
