import ConversationList from "./ConversationList";
import ChatPanel from "./ChatPanel";
import ClientPanel from "./ClientPanel";

export default function InboxLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 300px",
        height: "100%",
        background: "#ffffff",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e2efec",
      }}
    >
      <ConversationList />
      <ChatPanel />
      <ClientPanel />
    </div>
  );
}
