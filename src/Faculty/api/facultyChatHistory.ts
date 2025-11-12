// src/faculty/api/facultyChatHistory.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:5200"; // change if backend is remote

export const fetchChatHistory = async (channelId: string) => {
  try {
    const token = await AsyncStorage.getItem("facultyToken");
    const response = await axios.get(`${API_BASE_URL}/faculty/chat/history/${channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.messages || [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const saveMessageToDB = async (data: {
  channelId: string;
  senderId: string;
  receiverId: string;
  message: string;
}) => {
  try {
    const token = await AsyncStorage.getItem("facultyToken");
    const response = await axios.post(`${API_BASE_URL}/faculty/chat/save`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving message:", error);
  }
};
