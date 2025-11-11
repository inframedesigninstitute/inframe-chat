"use client"
declare const window: any

import { useCallback, useEffect, useRef, useState } from "react"
import { generateAgoraToken, saveMessage } from "../services/agoraService"

interface UseAgoraRTMParams {
  channelId: string
  userId: string
  userName: string
}

export interface Message {
  id: string
  text: string
  userId: string
  userName: string
  timestamp: string
  isSent: boolean
  targetUserId?: string // optional for private messages
}

export const useAgoraRTM = ({ channelId, userId, userName }: UseAgoraRTMParams) => {
  const clientRef = useRef<any>(null)
  const channelRef = useRef<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeClient = useCallback(async () => {
    try {
      if (typeof window === "undefined") return

      const AgoraRTM = (await import("agora-rtm-sdk")).default || (await import("agora-rtm-sdk"))
      const token = await generateAgoraToken(userId)

      const client = AgoraRTM.createInstance(process.env.REACT_APP_AGORA_APP_ID as string)
      clientRef.current = client

      await client.login({ uid: userId, token })
      const channel = client.createChannel(channelId)
      channelRef.current = channel

      // Listen to channel messages
      channel.on("ChannelMessage", (msg: any, memberId: string) => {
        try {
          const parsed = JSON.parse(msg.text)
          const newMessage: Message = {
            id: Date.now().toString(),
            text: parsed.text,
            userId: memberId,
            userName: parsed.userName || "Unknown",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSent: memberId === userId,
          }
          setMessages((prev) => [...prev, newMessage])
        } catch {
          console.error("Invalid message JSON")
        }
      })

      await channel.join()
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error("Agora RTM init error:", err)
      setError(err instanceof Error ? err.message : "Failed to init Agora RTM")
    }
  }, [channelId, userId])

  const sendMessage = useCallback(
    async (text: string, targetUserId?: string) => {
      if (!channelRef.current || !isConnected) return false
      try {
        const data = JSON.stringify({ text, userName })
        if (targetUserId) {
          // Send private message
          await clientRef.current.sendMessageToPeer({ text: data }, targetUserId)
        } else {
          await channelRef.current.sendMessage({ text: data })
        }

        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          userId,
          userName,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isSent: true,
          targetUserId,
        }

        setMessages((prev) => [...prev, newMessage])
        await saveMessage({
          channelId,
          userId,
          userName,
          text,
          timestamp: new Date().toISOString(),
          
        })

        return true
      } catch (err) {
        console.error("Agora RTM send error:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")
        return false
      }
    },
    [channelId, userId, userName, isConnected]
  )

  const disconnect = useCallback(async () => {
    try {
      if (channelRef.current) await channelRef.current.leave()
      if (clientRef.current) await clientRef.current.logout()
      setIsConnected(false)
    } catch (err) {
      console.error("Agora RTM disconnect error:", err)
    }
  }, [])

  useEffect(() => {
    initializeClient()
    return () => {
      void disconnect()
    }
  }, [initializeClient, disconnect])

  return { messages, isConnected, error, sendMessage, disconnect }
}
