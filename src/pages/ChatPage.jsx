import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ChatBubble from "@/components/ChatBubble";
import { ArrowLeft, Send } from "lucide-react";

const ChatPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [receiverId, setReceiverId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: job } = await supabase
        .from("jobs")
        .select("title, hirer_id")
        .eq("id", jobId)
        .maybeSingle();

      if (job && user) {
        if (job.hirer_id === user.id) {
          // I'm the hirer, find the worker
          const { data: app } = await supabase
            .from("applications")
            .select(
              "worker_id, profiles!applications_worker_id_fkey(full_name)",
            )
            .eq("job_id", jobId)
            .limit(1)
            .maybeSingle();
          setChatTitle(app?.profiles?.full_name || job.title);
          setReceiverId(app?.worker_id || null);
        } else {
          // I'm the worker, receiver is the hirer
          const { data: hirerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", job.hirer_id)
            .maybeSingle();
          setChatTitle(hirerProfile?.full_name || job.title);
          setReceiverId(job.hirer_id);
        }
      }

      // Fetch only messages between these two users for this job
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("job_id", jobId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };

    fetchData();

    const channel = supabase
      .channel(`chat-${jobId}-${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const msg = payload.new;
          // Only add message if it involves the current user
          if (msg.sender_id === user?.id || msg.receiver_id === user?.id) {
            setMessages((prev) => [...prev, msg]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending || !receiverId) return;
    setSending(true);
    await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-svh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-foreground truncate">{chatTitle}</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.content}
            isMe={msg.sender_id === user?.id}
            timestamp={new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-3 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-12 rounded-xl border border-input bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || !receiverId}
            className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center press disabled:opacity-50"
          >
            <Send size={18} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
