# 📞 Video & Audio Calling - Complete Guide

## 🎯 Overview

WhatsApp-style video and audio calling implemented using **Agora RTC SDK** for real-time communication.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Call Flow                            │
└─────────────────────────────────────────────────────────┘

User A (Caller)                          User B (Receiver)
     │                                            │
     │ 1. Click video/audio button                │
     ├──────────────────────────────────>         │
     │                                            │
     │ 2. Start Call (CallContext)                │
     │    - Generate RTC Token                    │
     │    - Join Agora Channel                    │
     │    - Create local tracks                   │
     │                                            │
     │ 3. Show OutgoingCallScreen                 │
     │    "Calling..."                            │
     │                                            │
     │ 4. Send call signal via RTM ────────────>  │
     │                                            │
     │                               5. Show IncomingCallScreen
     │                                  "Ringing..."
     │                                            │
     │                               6. User accepts call
     │                                  - Join same channel
     │                                  - Create local tracks
     │                                            │
     │ <────────────── Both connected ──────────> │
     │                                            │
     │ 7. Navigate to VideoCallScreen             │
     │    - Show local video (PiP)                │
     │    - Show remote video (full screen)       │
     │    - Call controls (mute, video, end)      │
     │                                            │
     │ 8. Either user ends call                   │
     │    - Close tracks                          │
     │    - Leave channel                         │
     │    - Navigate back                         │
     └────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
chatapp/
├── src/
│   ├── contexts/
│   │   └── CallContext.tsx              # ✅ Global call state management
│   │
│   ├── components/
│   │   ├── OutgoingCallScreen.tsx       # ✅ "Calling..." screen
│   │   ├── IncomingCallScreen.tsx       # ✅ "Ringing..." screen  
│   │   └── VideoCallScreen.tsx          # ✅ Active call UI
│   │
│   ├── Admin/
│   │   ├── App.tsx                      # ✅ Wrapped with CallProvider
│   │   ├── navigation/
│   │   │   └── RootNavigator.tsx        # ✅ Call screens added
│   │   └── components/
│   │       └── ChatThread.tsx           # ✅ Video/audio call buttons
│   │
│   ├── Faculty/
│   │   ├── App.tsx                      # ✅ (To be wrapped)
│   │   └── components/
│   │       └── FacultyChatThread.tsx    # ✅ (To add buttons)
│   │
│   └── Students/
│       ├── App.tsx                      # ✅ (To be wrapped)
│       └── components/
│           └── ChatThread.tsx           # ✅ (To add buttons)
│
└── backend/
    └── controller/
        └── agoraController.js           # ✅ RTC token generation
```

---

## 🔧 Components Breakdown

### **1. CallContext.tsx**
**Purpose:** Global state management for calls

**Features:**
- RTC client initialization
- Token generation
- Start/accept/reject/end call logic
- Media controls (mute, video, speaker, camera switch)
- Track management (audio/video)

**Key Methods:**
```typescript
startCall(receiverId, receiverName, callType)  // Start outgoing call
acceptCall()                                     // Accept incoming call
rejectCall()                                     // Reject incoming call
endCall()                                        // End active call
toggleAudio()                                    // Mute/unmute mic
toggleVideo()                                    // Turn video on/off
```

---

### **2. OutgoingCallScreen.tsx**
**Purpose:** Show while calling someone

**Features:**
- Animated "Calling..." UI
- Receiver name & avatar
- End call button
- Auto navigate to VideoCallScreen when connected

**States:**
- `calling` → Dialing
- `ringing` → Other person's phone is ringing
- `connected` → Navigate to video call

---

### **3. IncomingCallScreen.tsx**
**Purpose:** Show when receiving a call

**Features:**
- Animated "Ringing..." UI
- Caller name & avatar
- Accept (green) and Decline (red) buttons
- Auto navigate to VideoCallScreen when accepted

**Actions:**
- Accept → Join call
- Decline → Reject call

---

### **4. VideoCallScreen.tsx**
**Purpose:** Active call UI (works for both video & audio calls)

**Features:**
- **Video Call:**
  - Remote video (full screen)
  - Local video (picture-in-picture)
  - Video controls

- **Audio Call:**
  - Large avatar (no video)
  - Audio-only mode

- **Call Controls:**
  - 🎤 Mute/Unmute mic
  - 📹 Turn video on/off
  - 📞 End call (red button)
  - 🔊 Speaker on/off
  - 📷 Switch camera (front/back)

- **Call Info:**
  - Call duration timer
  - Participant name
  - Connection status

---

## 🔗 Integration Steps

### **Step 1: Install Dependencies** ✅
Already installed:
```json
{
  "agora-rtc-sdk-ng": "^4.23.0",
  "agora-rtc-react": "^2.5.0",
  "agora-react-native-rtm": "^2.2.6"
}
```

---

### **Step 2: Backend Setup** ✅
Backend already has RTC token generation:

```javascript
// POST /web/agora/generate-rtc-token
const rtcTokenGenerate = async (req, res) => {
    const { channelName, uid } = req.body;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
        process.env.APP_ID,
        process.env.APP_CERTIFICATE,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpiredTs
    );
    
    res.status(200).json({ token, uid, channelName });
};
```

---

### **Step 3: Add CallProvider** ✅

**Admin/App.tsx:**
```typescript
import { CallProvider } from '../contexts/CallContext';

return (
  <NavigationContainer>
    <CallProvider>           {/* ✅ Added */}
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </CallProvider>
  </NavigationContainer>
);
```

**Repeat for Faculty/App.tsx and Students/App.tsx**

---

### **Step 4: Add Call Screens to Navigation** ✅

**Admin/navigation/RootNavigator.tsx:**
```typescript
import OutgoingCallScreen from '../../components/OutgoingCallScreen';
import IncomingCallScreen from '../../components/IncomingCallScreen';
import ActiveVideoCallScreen from '../../components/VideoCallScreen';

<Stack.Navigator>
  {/* Other screens... */}
  
  <Stack.Screen 
    name="OutgoingCall" 
    component={OutgoingCallScreen} 
    options={{ presentation: 'fullScreenModal', headerShown: false }} 
  />
  
  <Stack.Screen 
    name="IncomingCall" 
    component={IncomingCallScreen} 
    options={{ presentation: 'fullScreenModal', headerShown: false }} 
  />
  
  <Stack.Screen 
    name="ActiveVideoCall" 
    component={ActiveVideoCallScreen} 
    options={{ presentation: 'fullScreenModal', headerShown: false }} 
  />
</Stack.Navigator>
```

---

### **Step 5: Add Call Buttons to ChatThread** ✅

**Admin/components/ChatThread.tsx:**
```typescript
import { useCall } from '../../contexts/CallContext';

const ChatThread = ({ channel }) => {
  const { startCall } = useCall();

  const handleVideoCall = async () => {
    await startCall(channel.id, channel.name, 'video');
    navigation.navigate('OutgoingCall');
  };

  const handleAudioCall = async () => {
    await startCall(channel.id, channel.name, 'audio');
    navigation.navigate('OutgoingCall');
  };

  return (
    <View style={styles.header}>
      {/* Video Call Button */}
      <TouchableOpacity onPress={handleVideoCall}>
        <Ionicons name="videocam" size={24} color="#000" />
      </TouchableOpacity>

      {/* Audio Call Button */}
      <TouchableOpacity onPress={handleAudioCall}>
        <Ionicons name="call" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};
```

---

## 🧪 Testing Guide

### **Test 1: Video Call (Admin → Faculty)**

1. **Admin Side:**
   - Open chat with Faculty member
   - Click 📹 video call button
   - Should show OutgoingCallScreen ("Calling...")

2. **Faculty Side:**
   - Should receive call notification (IncomingCallScreen)
   - Shows "Ringing..." with Accept/Decline buttons

3. **Accept Call:**
   - Faculty clicks Accept
   - Both navigate to VideoCallScreen
   - Admin sees Faculty's video (full screen)
   - Faculty sees Admin's video (full screen)
   - Both see own video in PiP (top right)

4. **Test Controls:**
   - Click 🎤 → Mic mutes/unmutes
   - Click 📹 → Video turns on/off
   - Click 🔊 → Speaker toggle
   - Click 📞 (red) → Call ends

---

### **Test 2: Audio Call (Faculty → Student)**

1. **Faculty Side:**
   - Open chat with Student
   - Click 📞 audio call button
   - Shows OutgoingCallScreen

2. **Student Side:**
   - Receives IncomingCallScreen
   - Clicks Accept

3. **Active Call:**
   - Both see VideoCallScreen in audio mode
   - Large avatar instead of video
   - Audio controls work (mute, speaker)

---

## 🐛 Troubleshooting

### **Issue 1: "RTC Client not initialized"**
**Solution:**
- Make sure CallProvider is wrapped around the app
- Check if Platform.OS === 'web' (RTC only works on web for now)

### **Issue 2: "Token generation failed"**
**Solution:**
- Check backend is running: `http://localhost:5200`
- Verify `process.env.APP_ID` and `process.env.APP_CERTIFICATE` in backend

### **Issue 3: "No video showing"**
**Solution:**
- Grant camera/mic permissions in browser
- Check if `localVideoTrack` is created properly
- Use browser DevTools → Console for errors

### **Issue 4: "Call not connecting"**
**Solution:**
- Both users must join the same `channelName`
- Check Agora console for channel activity
- Verify network connection

---

## 📊 Environment Variables (Backend)

```env
APP_ID=20e5fa9e1eb24b799e01c45eaca5c901
APP_CERTIFICATE=your_agora_app_certificate
```

Get these from: https://console.agora.io/

---

## 🚀 Next Steps (TODO)

### **Remaining Tasks:**

1. **Add CallProvider to Faculty & Student apps** ⏳
2. **Add call buttons to FacultyChatThread** ⏳
3. **Add call buttons to StudentChatThread** ⏳
4. **Implement call signaling via Agora RTM** ⏳
   - Send call notification to receiver
   - Handle accept/reject events

5. **Add call notifications** ⏳
   - Push notification when receiving call
   - Ringtone/vibration

6. **Mobile Support** ⏳
   - Currently only works on web
   - For mobile: Need Expo custom dev client or bare workflow
   - Install native Agora SDK

---

## 📱 Platform Support

| Feature | Web | Android | iOS |
|---------|-----|---------|-----|
| Video Call | ✅ | ⏳ | ⏳ |
| Audio Call | ✅ | ⏳ | ⏳ |
| Screen Share | ⏳ | ⏳ | ⏳ |

**Note:** Mobile support requires additional native setup.

---

## 🔐 Security Notes

1. **RTC Tokens expire after 24 hours**
2. **Token is generated server-side** (secure)
3. **User ID from AsyncStorage** (must be saved on login)

---

## 📚 Resources

- [Agora Web SDK Docs](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Agora React Native SDK](https://docs.agora.io/en/video-calling/reference/react-native-sdk)
- [Agora Console](https://console.agora.io/)

---

## ✅ Summary

**What's Working:**
- ✅ CallContext created
- ✅ OutgoingCallScreen
- ✅ IncomingCallScreen
- ✅ VideoCallScreen (with audio mode)
- ✅ Admin app integrated
- ✅ RTC token generation
- ✅ Call buttons in ChatThread

**What's Pending:**
- ⏳ Faculty/Student app integration
- ⏳ Call signaling (RTM)
- ⏳ Call notifications
- ⏳ Mobile native support

---

## 🎯 Quick Start (Testing)

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd chatapp
   npm run web
   ```

3. **Login as Admin:**
   - Email: `admin@inframe.edu`
   - Password: `Admin@123`

4. **Open chat with someone**

5. **Click 📹 or 📞 button**

6. **Open another browser tab** (simulate receiver)

7. **Accept call and test!**

---

**Happy Calling! 📞🎥**

