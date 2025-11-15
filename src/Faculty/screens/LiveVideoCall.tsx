// src/Faculty/screens/LiveVideoCall.tsx (Web-Only Code)

import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ❌ WARNING: Agora RTC Engine या RtcSurfaceView यहाँ IMPORT न करें।

// 👉 Replace with your actual Agora credentials
const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";

// RTC Token API URL
const RTC_TOKEN_API_URL = "http://localhost:5200/web/agora/generate-rtc-token"; 
const CURRENT_USER_ID = "6614140024479903b22b1111"; // Mock User ID

export default function LiveVideoCall() {
    const route = useRoute();
    const { channelName } = route.params as { channelName: string };

    const [rtcToken, setRtcToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch RTC Token
    const fetchRtcToken = async (channel: string, uid: string) => {
        try {
            const response = await axios.post(RTC_TOKEN_API_URL, {
                channelName: channel,
                uid: uid,
            });

            if (response.data.status === 1) {
                setRtcToken(response.data.token);
            } else {
                Alert.alert("Token Error", response.data.msg || "Failed to get RTC token.");
            }
        } catch (error) {
            console.error("RTC Token Fetch Error:", error);
            Alert.alert("API Error", "Failed to connect to token server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRtcToken(channelName, CURRENT_USER_ID);
    }, [channelName]);

    // चूंकि यह केवल वेब के लिए है, हम केवल टोकन दिखाने और वीडियो कॉल को अस्वीकार करने के लिए फॉलबैक दिखाते हैं।
    // अगर आप वेब पर वीडियो कॉल चाहते हैं, तो आपको Agora Web SDK का उपयोग करना होगा, न कि react-native-agora का।

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.info}>Fetching Token for {channelName}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>🎥 Video Call Status (Web)</Text>

            <View style={styles.infoBox}>
                <Text style={styles.label}>Channel Name:</Text>
                <Text style={styles.value}>{channelName}</Text>
                
                <Text style={styles.label}>RTC Token Status:</Text>
                {rtcToken ? (
                    <>
                        <Text style={styles.success}>✅ Token Fetched Successfully</Text>
                        <Text style={styles.smallInfo}>Token: {rtcToken.substring(0, 30)}...</Text>
                    </>
                ) : (
                    <Text style={styles.error}>❌ Failed to get RTC Token</Text>
                )}
            </View>
            
            <Text style={styles.webFallbackText}>
                ⚠️ **Video Calling (using native libraries) is unsupported on Web.**
                {"\n"}
                The API integration for the token is successful, but the video components won't run.
            </Text>

            <TouchableOpacity style={styles.endButton} onPress={() => {/* navigate back logic */}}>
                <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    heading: {
        color: "#fff",
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    infoBox: {
        backgroundColor: '#1c1c1c',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        width: '80%',
    },
    label: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 10,
    },
    value: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    success: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: 'bold',
    },
    smallInfo: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
    },
    webFallbackText: {
        color: "#FFD700",
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    info: {
        color: "#ccc",
        fontSize: 16,
    },
    endButton: {
        backgroundColor: "#404040",
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});