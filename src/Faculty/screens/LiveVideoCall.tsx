// import { useRoute } from "@react-navigation/native";
// import { useEffect, useState } from "react";
// import {
//   PermissionsAndroid,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // Define Native Agora Imports (only for native platforms)
// let RtcSurfaceView: any;
// let createAgoraRtcEngine: any;
// let ChannelProfileType: any;
// let ClientRoleType: any;
// let IRtcEngine: any;

// const isNative = Platform.OS === 'android' || Platform.OS === 'ios';

// if (isNative) {
//   try {
//     const agora = require("react-native-agora");
//     RtcSurfaceView = agora.RtcSurfaceView;
//     createAgoraRtcEngine = agora.createAgoraRtcEngine;
//     ChannelProfileType = agora.ChannelProfileType;
//     ClientRoleType = agora.ClientRoleType;
//     IRtcEngine = agora.IRtcEngine;
//   } catch (e) {
//     console.error("Failed to load react-native-agora on native device:", e);
//   }
// }

// // 👉 Replace with your actual Agora credentials
// const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";
// const TOKEN: string = "";

// // Mock/Web Component for unsupported platform
// const WebFallback = () => (
//   <View style={styles.container}>
//     <Text style={styles.webFallbackText}>
//       ⚠️ Video calling is currently only supported on iOS and Android devices.
//     </Text>
//   </View>
// );

// export default function LiveVideoCall() {
//   const route = useRoute();
//   const { channelName } = route.params as { channelName: string };

//   const [engine, setEngine] = useState<typeof IRtcEngine | null>(null);
//   const [isJoined, setIsJoined] = useState(false);
//   const [remoteUid, setRemoteUid] = useState<number | null>(null);

//   if (!isNative) {
//     return <WebFallback />;
//   }
  
//   // ✅ Request Camera & Audio Permission (Android)
//   const requestPermissions = async () => {
//     if (Platform.OS === "android") {
//       await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//       ]);
//     }
//   };

//   // ✅ Initialize Agora Engine
//   useEffect(() => {
//     if (!isNative || !createAgoraRtcEngine) return;

//     const initAgora = async () => {
//       await requestPermissions();

//       const agoraEngine = createAgoraRtcEngine();
//       setEngine(agoraEngine);

//       agoraEngine.initialize({
//         appId: APP_ID,
//         channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
//       });

//       // ✅ Enable video and set client role
//       agoraEngine.enableVideo();
//       agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

//       // ✅ Event Listeners
//       agoraEngine.registerEventHandler({
//         onJoinChannelSuccess: () => {
//           console.log("✅ Joined Agora Channel Successfully");
//           setIsJoined(true);
//         },
//         onUserJoined: (_connection: any, uid: number) => {
//           console.log("👤 Remote user joined:", uid);
//           setRemoteUid(uid);
//         },
//         onUserOffline: (_connection: any, uid: number) => {
//           console.log("❌ Remote user left:", uid);
//           setRemoteUid(null);
//         },
//       });

//       // ✅ Join the channel safely
//       agoraEngine.joinChannel(TOKEN, channelName, 0, {
//         clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//       });
//     };

//     initAgora();

//     // ✅ Cleanup on unmount
//     return () => {
//       if (engine) {
//         engine.leaveChannel();
//         engine.release();
//       }
//     };
//   }, [engine, channelName]);

//   // ✅ Leave Channel
//   const leaveChannel = () => {
//     if (engine) {
//       engine.leaveChannel();
//       setIsJoined(false);
//       setRemoteUid(null);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>🎥 Agora Live Video Call: {channelName}</Text>

//       {isJoined ? (
//         <>
//           <View style={styles.videoContainer}>
//             <RtcSurfaceView canvas={{ uid: 0 }} style={styles.localVideo} />
//             {remoteUid !== null && (
//               <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.remoteVideo} />
//             )}
//           </View>

//           <TouchableOpacity style={styles.endButton} onPress={leaveChannel}>
//             <Text style={styles.buttonText}>End Call</Text>
//           </TouchableOpacity>
//         </>
//       ) : (
//         <Text style={styles.info}>Joining Agora Channel: {channelName}...</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   heading: {
//     color: "#fff",
//     fontSize: 18,
//     marginBottom: 10,
//     marginTop: 40,
//   },
//   videoContainer: {
//     flex: 1,
//     width: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   localVideo: {
//     width: 150,
//     height: 200,
//     position: "absolute",
//     top: 50,
//     right: 20,
//     zIndex: 2,
//   },
//   remoteVideo: {
//     width: "100%",
//     height: "100%",
//   },
//   info: {
//     color: "#ccc",
//     fontSize: 16,
//   },
//   endButton: {
//     backgroundColor: "red",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   webFallbackText: {
//     color: "#FFD700",
//     fontSize: 18,
//     textAlign: 'center',
//     padding: 20,
//   }
// });
import { StyleSheet, Text, View } from 'react-native'

const LiveVideoCall = () => {
  return (
    <View>
      <Text>LiveVideoCall</Text>
    </View>
  )
}

export default LiveVideoCall

const styles = StyleSheet.create({})