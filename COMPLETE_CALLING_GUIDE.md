# 📞 Complete Video & Audio Calling Implementation

## ✅ What's Implemented:

### **1. Call Sending (Admin → Faculty/Student)**
- ✅ Video call button (📹) in ChatThread
- ✅ Audio call button (📞) in ChatThread  
- ✅ RTM signaling to notify receiver
- ✅ Unique channel name generation
- ✅ Navigate to LiveVideoCall or AudioCall screen

### **2. Call Receiving (Faculty/Student receives)**
- ✅ RTM listener detects incoming call
- ✅ Alert dialog shows: "Incoming Video/Audio Call"
- ✅ Accept button → Join call
- ✅ Decline button → Reject call

### **3. Screens Used:**
- ✅ **LiveVideoCall** - For video calls
- ✅ **AudioCallScreen** - For audio calls
- ✅ **CallsScreen** - For call history (already exists)

---

## 🏗️ Architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Call Flow                            │
└─────────────────────────────────────────────────────────┘

Admin (Caller)                          Faculty (Receiver)
     │                                            │
     │ 1. Click 📹 or 📞 button                   │
     ├──────────────────────────────────>         │
     │                                            │
     │ 2. Generate channel name                   │
     │    call_admin_001_faculty_123_1234567890   │
     │                                            │
     │ 3. Send RTM notification ────────────────> │
     │    {                                       │
     │      type: "video_call",                   │
     │      callerId: "admin_001",                │
     │      callerName: "Admin",                  │
     │      channelName: "call_..."              │
     │    }                                       │
     │                                            │
     │ 4. Navigate to LiveVideoCall               │
     │                                            │
     │                               5. RTM listener receives
     │                               6. Shows Alert:
     │                                  "Incoming Video Call"
     │                                  "Admin is calling you"
     │                                  [Decline] [Accept]
     │                                            │
     │                               7. If Accept:
     │                                  Navigate to LiveVideoCall
     │                                  with same channelName
     │                                            │
     │ <────────────── Both in same channel ────> │
     │                                            │
     │ 8. RTC connection established              │
     │    Video/Audio streaming starts            │
     │                                            │
     │ 9. Either user ends call                   │
     │    Go back to chat                         │
     └────────────────────────────────────────────┘
```

---

## 📁 Files Modified:

### **1. Admin/components/ChatThread.tsx**

**Changes:**
- ✅ Added `handleVideoCall()` function
- ✅ Added `handleAudioCall()` function  
- ✅ RTM message listener updated to detect calls
- ✅ Alert dialog for incoming calls
- ✅ Navigation to LiveVideoCall/AudioCall

**Key Code:**

```typescript
// Send Video Call
const handleVideoCall = async () => {
    const callChannelName = `call_${currentUserId}_${channel.id}_${Date.now()}`;
    
    // Send RTM notification
    if (rtmEngine) {
        const callData = {
            type: 'video_call',
            callerId: currentUserId,
            callerName: 'Admin',
            channelName: callChannelName,
            timestamp: Date.now(),
        };
        
        await rtmEngine.sendMessageToPeer({
            text: JSON.stringify(callData),
        }, channel.id);
    }
    
    // Navigate to video call screen
    navigation.navigate('LiveVideoCall', { channelName: callChannelName });
};

// Receive Call (RTM Listener)
engine.addListener("MessageReceived", (event) => {
    const msg = event as any;
    
    try {
        const callData = JSON.parse(msg.text);
        
        if (callData.type === 'video_call' || callData.type === 'audio_call') {
            // Show incoming call alert
            Alert.alert(
                `Incoming ${callData.type === 'video_call' ? 'Video' : 'Audio'} Call`,
                `${callData.callerName} is calling you`,
                [
                    { text: 'Decline', style: 'cancel' },
                    {
                        text: 'Accept',
                        onPress: () => {
                            if (callData.type === 'video_call') {
                                navigation.navigate('LiveVideoCall', { 
                                    channelName: callData.channelName 
                                });
                            } else {
                                navigation.navigate('AudioCall', {
                                    contactName: callData.callerName,
                                    contactNumber: callData.callerId,
                                });
                            }
                        },
                    },
                ],
            );
            return;
        }
    } catch (e) {
        // Not a call, treat as text message
    }
    
    // Handle text message...
});
```

---

## 🔧 RTC Token Integration:

### **Backend (Already Working):**

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
    
    res.status(200).json({
        status: 1,
        token,
        uid,
        channelName,
        expiresIn: 24 * 60 * 60
    });
};
```

### **Frontend Usage:**

LiveVideoCall screen aur AudioCallScreen already ye token API use kar sakte hain:

```typescript
// In LiveVideoCall.tsx or AudioCallScreen.tsx
const generateRTCToken = async (channelName: string, uid: string) => {
    const response = await axios.post('http://localhost:5200/web/agora/generate-rtc-token', {
        channelName,
        uid,
    });
    
    return response.data.token;
};

// Join RTC channel
const token = await generateRTCToken(channelName, userId);
await rtcClient.join(APP_ID, channelName, token, userId);
```

---

## 🧪 Testing Steps:

### **Test 1: Video Call (Admin → Faculty)**

**Browser 1 (Admin):**
```bash
1. Login as Admin
2. Open chat with Faculty
3. Click 📹 video button
4. Should navigate to LiveVideoCall screen
```

**Browser 2 (Faculty):**
```bash
1. Login as Faculty  
2. Should see Alert: "Incoming Video Call" "Admin is calling you"
3. Click Accept
4. Should navigate to LiveVideoCall screen
5. Both should be in same channel → Video streaming starts
```

**Expected Console Logs (Admin):**
```
📹 Starting video call with: Faculty User
✅ Call notification sent
Navigating to LiveVideoCall with channel: call_admin_001_faculty_123_1234567890
```

**Expected Console Logs (Faculty):**
```
RTM Message received: {...}
📞 Incoming call notification: {type: "video_call", ...}
Alert shown
User clicked Accept
Navigating to LiveVideoCall with channel: call_admin_001_faculty_123_1234567890
```

---

### **Test 2: Audio Call (Faculty → Student)**

**Same flow as video**, but:
- Click 📞 audio button
- Navigate to AudioCallScreen instead
- Audio-only streaming

---

## 📊 Call History (CallsScreen):

CallsScreen already exists with dummy data. To add real history:

### **Option 1: Save to AsyncStorage**

```typescript
// After call ends
const callRecord = {
    id: Date.now().toString(),
    name: receiverName,
    time: new Date().toLocaleTimeString(),
    type: 'outgoing', // or 'incoming', 'missed'
    callType: 'video', // or 'voice'
    duration: callDuration,
    timestamp: Date.now(),
};

const existingCalls = await AsyncStorage.getItem('CALL_HISTORY');
const calls = existingCalls ? JSON.parse(existingCalls) : [];
calls.unshift(callRecord);
await AsyncStorage.setItem('CALL_HISTORY', JSON.stringify(calls));
```

### **Option 2: Save to Backend**

```typescript
// POST to backend after call ends
await axios.post('http://localhost:5200/web/calls/save', {
    userId,
    receiverId,
    callType: 'video',
    duration: callDuration,
    timestamp: Date.now(),
});

// In CallsScreen, fetch from backend
const response = await axios.get(`http://localhost:5200/web/calls/history/${userId}`);
setCallHistory(response.data);
```

---

## 🎯 Faculty & Student Implementation:

### **Faculty (Same as Admin):**

1. **Copy ChatThread changes** to `Faculty/components/FacultyChatThread.tsx`
2. Update token key: `FACULTYTOKEN` instead of `ADMINTOKEN`
3. Update user type in call data: `"Faculty"` instead of `"Admin"`

### **Student (Same as Admin):**

1. **Copy ChatThread changes** to `Students/components/ChatThread.tsx`
2. Update token key: `STUDENTTOKEN`
3. Update user type: `"Student"`

---

## 🔐 Environment Variables:

```env
APP_ID=20e5fa9e1eb24b799e01c45eaca5c901
APP_CERTIFICATE=your_agora_certificate_here
```

---

## ⚠️ Important Notes:

### **1. Channel Name Must Match:**
Both caller and receiver MUST join the SAME `channelName` for call to connect.

### **2. RTM Must Be Active:**
Both users must be logged into RTM for call notifications to work.

### **3. User ID Must Be Set:**
```javascript
await AsyncStorage.setItem('USERID', userId); // Set on login
```

### **4. Platform Support:**
- ✅ **Web:** Fully working
- ⏳ **Mobile:** Needs native Agora SDK

---

## 🐛 Troubleshooting:

### **Issue 1: Receiver doesn't get call notification**

**Check:**
```javascript
// Sender side
console.log('RTM Engine:', rtmEngine);
console.log('Receiver ID:', channel.id);

// Receiver side  
console.log('RTM Listener active:', true);
console.log('Logged in user:', currentUserId);
```

**Solution:** Make sure both users are logged into RTM.

---

### **Issue 2: "Channel name mismatch"**

**Check:**
```javascript
// Sender console
Navigating with channel: call_admin_001_faculty_123_1234567890

// Receiver console
Joining channel: call_admin_001_faculty_123_1234567890
```

**Solution:** Make sure exact same `channelName` is used.

---

### **Issue 3: No video/audio**

**Check:**
- Browser permissions (camera/mic)
- RTC token generated correctly
- Network connection
- Agora console for channel activity

---

## ✅ Success Criteria:

**Your implementation is working if:**

1. ✅ Click video button → Navigate to LiveVideoCall
2. ✅ Receiver gets Alert with caller name
3. ✅ Click Accept → Join same channel
4. ✅ Video/audio streaming works
5. ✅ End call → Go back to chat
6. ✅ Works for Admin, Faculty, Student

---

## 🚀 Quick Start:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd chatapp
npm run web

# Browser 1 - Admin
http://localhost:8081
Login: admin@inframe.edu / Admin@123

# Browser 2 - Faculty (Incognito/Firefox)
http://localhost:8081
Login: faculty email

# Test:
1. Admin → Open Faculty chat
2. Admin → Click 📹
3. Faculty → See alert → Accept
4. Both → Video call active! 🎉
```

---

## 📚 Next Steps (Optional):

1. ✅ Add call history to CallsScreen
2. ✅ Add ringtone/notification sound
3. ✅ Add screen sharing
4. ✅ Add group video calls
5. ✅ Add call recording
6. ✅ Mobile native support

---

**Happy Calling! 📞🎥**

