// import { useEffect, useState } from "react";
// import {
//   PermissionsAndroid,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import {
//   ChannelProfileType,
//   ClientRoleType,
//   createAgoraRtcEngine,
//   IRtcEngine,
//   RtcSurfaceView,
// } from "react-native-agora";

// // 👉 Replace with your actual Agora credentials
// const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";
// const CHANNEL_NAME = "testchannel";
// // Use empty string if you have no token, instead of null ✅
// const TOKEN: string = "";

// export default function LiveVideoCall() {
//   const [engine, setEngine] = useState<IRtcEngine | null>(null);
//   const [isJoined, setIsJoined] = useState(false);
//   const [remoteUid, setRemoteUid] = useState<number | null>(null);

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
//         onUserJoined: (_connection, uid) => {
//           console.log("👤 Remote user joined:", uid);
//           setRemoteUid(uid);
//         },
//         onUserOffline: (_connection, uid) => {
//           console.log("❌ Remote user left:", uid);
//           setRemoteUid(null);
//         },
//       });

//       // ✅ Join the channel safely
//       agoraEngine.joinChannel(TOKEN, CHANNEL_NAME, 0, {
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
//   }, []);

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
//       <Text style={styles.heading}>🎥 Agora Live Video Call</Text>

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
//         <Text style={styles.info}>Joining Agora Channel...</Text>
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