import { cn } from "@/lib/utils";

const ChatBubble = ({ message, isMe, timestamp }) => {
  return (
    <div className={cn("flex mb-2", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
          isMe
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md",
        )}
      >
        <p>{message}</p>
        {timestamp && (
          <p
            className={cn(
              "text-[10px] mt-1",
              isMe ? "text-primary-foreground/60" : "text-muted-foreground",
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
