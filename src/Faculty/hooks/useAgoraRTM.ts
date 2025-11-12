import axios from "axios";
import { useEffect, useRef, useState } from "react";
declare const window: any;

interface UseAgoraRTMProps {
  channelId: string;
  userId: string;
  userName: string;
}

export const useAgoraRTM = ({ channelId, userId, userName }: UseAgoraRTMProps) => {
  const [client, setClient] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const tokenRef = useRef<string>("");

  // ✅ Fetch RTM token from backend
  const getRTMToken = async (uid: string) => {
    try {
      const res = await axios.post("http://localhost:5200/agora/generate-rtm-token", { uid });
      if (res.data?.agoraToken) {
        tokenRef.current = res.data.agoraToken;
        return res.data.agoraToken;
      } else {
        console.error("RTM token fetch failed:", res.data);
        return null;
      }
    } catch (err) {
      console.error("RTM token error:", err);
      return null;
    }
  };

  // ✅ Initialize Agora RTM client
  useEffect(() => {
    let AgoraRTM: any;

    const initAgora = async () => {
      try {
        // ⛔ Only load AgoraRTM on client (window defined)
        if (typeof window === "undefined") return;

        const mod = await import("agora-rtm-sdk");
        AgoraRTM = mod.default || mod;

        const token = await getRTMToken(userId);
        if (!token) {
          console.error("No RTM token received");
          return;
        }

        const rtmClient = AgoraRTM.createInstance("20e5fa9e1eb24b799e01c45eaca5c901");
        await rtmClient.login({ uid: userId, token });
        setClient(rtmClient);
        setIsConnected(true);
        console.log("Agora RTM login success ✅");

        const rtmChannel = await rtmClient.createChannel(channelId);
        await rtmChannel.join();
        setChannel(rtmChannel);
        console.log("Joined channel:", channelId);

        rtmChannel.on("ChannelMessage", (message: any, memberId: string) => {
          console.log("Received message:", message.text, "from", memberId);
          setReceivedMessage(message.text);
        });
      } catch (error) {
        console.error("Agora RTM init error:", error);
      }
    };

    initAgora();

    return () => {
      const cleanup = async () => {
        if (channel) await channel.leave();
        if (client) await client.logout();
      };
      cleanup();
    };
  }, [channelId]);

  // ✅ Send message
  const sendMessage = async (message: string) => {
    try {
      if (!channel) return false;
      await channel.sendMessage({ text: message });
      setMessages((prev) => [...prev, message]);
      console.log("Message sent:", message);
      return true;
    } catch (error) {
      console.error("Send message error:", error);
      return false;
    }
  };

  return {
    client,
    channel,
    messages,
    receivedMessage,
    sendMessage,
    isConnected,
  };
};
