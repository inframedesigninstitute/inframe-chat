import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

interface GenerateTokenParams {
  uid: string
}

interface SaveMessageParams {
  channelId: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

interface Message {
  id: string
  text: string
  userId: string
  userName: string
  timestamp: string
  isSent: boolean
}

// Generate Agora RTM token
export const generateAgoraToken = async (uid: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/agora/generate-rtm-token`, {
      uid,
    })

    if (response.data.status === 1) {
      return response.data.agoraToken
    } else {
      throw new Error(response.data.msg)
    }
  } catch (error) {
    console.error("[v0] Error generating Agora token:", error)
    throw error
  }
}

// Save message to backend
export const saveMessage = async (params: SaveMessageParams): Promise<void> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/agora/save-message`, params)

    if (response.data.status !== 1) {
      throw new Error(response.data.msg)
    }
  } catch (error) {
    console.error("[v0] Error saving message:", error)
    throw error
  }
}

// Get message history
export const getMessageHistory = async (channelId: string): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/agora/message-history`, {
      params: { channelId },
    })

    if (response.data.status === 1) {
      return response.data.data || []
    } else {
      throw new Error(response.data.msg)
    }
  } catch (error) {
    console.error("[v0] Error getting message history:", error)
    return []
  }
}
