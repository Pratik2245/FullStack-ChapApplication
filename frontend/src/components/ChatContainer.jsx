import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utlis";
import { X, Loader2 } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    isMessageLoading,
    getMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [sendingMessage, setSendingMessage] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessageLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePicture || "/avatar.png"
                      : selectedUser.profilePicture || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col relative group">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
              {message.senderId === authUser._id && (
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="absolute -right-2 -top-2 btn btn-circle btn-xs bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        {sendingMessage && (
          <div className="chat chat-end">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={authUser.profilePicture || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-bubble flex flex-col relative">
              {sendingMessage.image && (
                <div className="relative">
                  <img
                    src={sendingMessage.image}
                    alt="Uploading..."
                    className="sm:max-w-[200px] rounded-md mb-2 opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                </div>
              )}
              {sendingMessage.text && <p>{sendingMessage.text}</p>}
            </div>
          </div>
        )}
      </div>

      <MessageInput setSendingMessage={setSendingMessage} />
    </div>
  );
};

export default ChatContainer;
