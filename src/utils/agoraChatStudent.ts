import axios from "axios";
import { setToken } from "../Redux/Slices/studentTokenSlice"; // Separate slice for student token
import store from "../Redux/Store/store";

const API_URL = "https://your-backend.com/agora/generate-rtm-token";

export interface AgoraTokenResponse {
  status: number;
  msg: string;
  agoraToken?: string;
  uid?: string;
  expiresIn?: number;
};

export const fetchStudentAgoraToken = async (uid: string) => {
  try {
    const response = await axios.post<AgoraTokenResponse>(API_URL, { uid });
    if (response.data.status === 1 && response.data.agoraToken) {
      store.dispatch(setToken({ token: response.data.agoraToken }));
      return response.data.agoraToken;
    } else {
      console.warn("Failed to get Agora token:", response.data.msg);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching Agora token:", error.message);
    return null;
  }
};
