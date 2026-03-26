import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ChatBubble from "@/components/ChatBubble";
import { ArrowLeft, Send } from "lucide-react";

const ChatPage = () => {
  const { jobId, workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [receiverId, setReceiverId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: job } = await supabase
        .from("jobs")
        .select("title, hirer_id")
        .eq("id", jobId)
        .maybeSingle();

      if (job) {
        const targetId = user.id === job.hirer_id ? workerId : job.hirer_id;
        setReceiverId(targetId);

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", targetId)
          .maybeSingle();

        setChatTitle(otherProfile?.full_name || job.title);

        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("job_id", jobId)
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${user.id})`,
          )
          .order("created_at", { ascending: true });

        setMessages(data || []);
      }
    };

    fetchData();

    const channel = supabase
      .channel(`chat-${jobId}-${workerId}`)
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
          // Only show message if it belongs to this specific pair
          const isMe = msg.sender_id === user.id;
          const isToMe = msg.receiver_id === user.id;
          const isRelatedToOther =
            msg.sender_id === workerId || msg.receiver_id === workerId;

          if ((isMe || isToMe) && isRelatedToOther) {
            setMessages((prev) => [...prev, msg]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, workerId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending || !receiverId) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-svh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press p-1">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-foreground truncate text-sm leading-none">
            {chatTitle}
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
            Job Discussion
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full mb-4 ${
                msg.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <ChatBubble
                message={msg.content}
                isMe={msg.sender_id === user?.id}
                timestamp={new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-12 rounded-xl border border-input bg-muted/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center press disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
