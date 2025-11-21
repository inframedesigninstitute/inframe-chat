# 🧪 Quick Testing Guide - Video/Audio Calling

## 🚀 Method 1: Single User Test (Easiest)

Test the outgoing call flow without needing a second user:

### **Steps:**

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   # Should see: Server running on port 5200
   ```

2. **Start Frontend:**
   ```bash
   cd chatapp
   npm run web
   # Opens on http://localhost:8081
   ```

3. **Login as Admin:**
   - Email: `admin@inframe.edu`
   - Password: `Admin@123`

4. **Open Any Chat:**
   - Click on a contact in chat list

5. **Click Video Call Button (📹):**
   - You'll see OutgoingCallScreen
   - Status: "Calling..."
   - Receiver name displayed

6. **Check Console Logs:**
   ```
   📹 Starting video call with: John Doe
   🔍 Checking AsyncStorage...
   📦 USERID: admin_hardcoded_001
   ✅ RTC Token generated: <token>
   ✅ Joined RTC channel
   ✅ Published video & audio tracks
   ```

7. **Test Controls:**
   - Click red button to end call
   - Should navigate back to chat

---

## 👥 Method 2: Two Users Test (Full Flow)

Test complete call flow with two users:

### **Setup:**

**Browser 1 (Chrome):**
```
http://localhost:8081
Login: Admin
```

**Browser 2 (Firefox or Chrome Incognito):**
```
http://localhost:8081
Login: Faculty or different admin
```

### **Steps:**

1. **Browser 1 (Caller):**
   - Open chat with Browser 2's user
   - Click 📹 video call button
   - See OutgoingCallScreen

2. **Browser 2 (Receiver):**
   - **Currently:** Won't automatically see IncomingCallScreen (call signaling pending)
   - **Workaround:** Manually navigate to IncomingCall screen

3. **Manual Test (Browser 2):**
   ```javascript
   // Open DevTools Console
   // Navigate to incoming call screen:
   window.location.href = '#/IncomingCall';
   ```

4. **Accept Call (Browser 2):**
   - Click Accept button (green)
   - Should join the call

5. **Both Users:**
   - Should see VideoCallScreen
   - Both videos should be visible
   - Test controls:
     - 🎤 Mute/Unmute
     - 📹 Video on/off
     - 📞 End call

---

## 🔧 Method 3: Manual Testing Script

Create a temporary test button for incoming calls:

### **Add to ChatThread.tsx (just for testing):**

```typescript
// Add this button temporarily in the header

{__DEV__ && (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
    onPress={() => {
      // Simulate incoming call for testing
      navigation.navigate('IncomingCall' as never);
    }}
  >
    <Ionicons name="call-outline" size={20} color="#fff" />
    <Text style={{ fontSize: 10, color: '#fff' }}>Test</Text>
  </TouchableOpacity>
)}
```

This gives you a TEST button to manually trigger IncomingCallScreen.

---

## 📊 Expected Console Logs

### **Caller Side (OutgoingCall):**
```
📹 Starting video call with: Faculty User
🔍 === CURRENT USER ID ===
📦 Stored USERID: admin_hardcoded_001
📞 Starting call...
   Channel: call_admin_hardcoded_001_faculty_123_1701234567890
   Caller: admin_hardcoded_001
   Receiver: faculty_123
   Type: video
✅ RTC Token generated
✅ Joined RTC channel
✅ Published video & audio tracks
```

### **Receiver Side (IncomingCall):**
```
✅ Accepting call...
✅ RTC Token generated
✅ Joined RTC channel: call_admin_hardcoded_001_faculty_123_1701234567890
✅ Published video & audio tracks
✅ Call accepted and joined
📢 User published: admin_hardcoded_001 video
📢 User published: admin_hardcoded_001 audio
```

### **Active Call (VideoCall):**
```
📹 Video on
🎤 Audio unmuted
Remote users: 1
✅ Connected
Duration: 00:15
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "RTC Client not initialized"**
```javascript
// Check CallProvider is wrapped
console.log('Is CallProvider present?', !!useCall);
```

**Solution:** Verify CallProvider in App.tsx

---

### **Issue 2: "Permission denied"**
Browser needs camera/mic permissions.

**Solution:**
- Chrome: Settings → Privacy → Site Settings → Camera/Mic → Allow
- Firefox: Click lock icon in address bar → Permissions

---

### **Issue 3: "Token generation failed"**
Backend not running or wrong URL.

**Solution:**
```bash
# Check backend
curl http://localhost:5200/web/agora/generate-rtc-token \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"channelName":"test","uid":"user123"}'

# Should return: {"status":1,"token":"..."}
```

---

### **Issue 4: "No video showing"**
Video track not created or browser compatibility.

**Solution:**
```javascript
// Check in VideoCallScreen
console.log('Local video track:', localVideoTrack);
console.log('Remote users:', remoteUsers);

// Verify browser support
console.log('Browser supports WebRTC:', !!navigator.mediaDevices);
```

---

## ✅ Success Criteria

Your implementation is working if:

1. ✅ Clicking video button shows OutgoingCallScreen
2. ✅ Console shows "RTC Token generated"
3. ✅ Console shows "Joined RTC channel"
4. ✅ No errors in console
5. ✅ End call button navigates back to chat
6. ✅ (Two users) Remote video is visible
7. ✅ (Two users) Controls work (mute, video, end)

---

## 🎯 Quick Debug Commands

Open browser console and run:

### **Check CallContext:**
```javascript
// Should have useCall available
import { useCall } from '../contexts/CallContext';
console.log('CallContext:', useCall);
```

### **Check Current User ID:**
```javascript
AsyncStorage.getItem('USERID').then(id => {
    console.log('Current USERID:', id);
});
```

### **Check RTC Client:**
```javascript
// In CallContext
console.log('RTC Client:', rtcClient);
console.log('Local tracks:', localAudioTrack, localVideoTrack);
```

### **Manually Join Call:**
```javascript
// Emergency test - join a test channel
const testChannel = 'test_call_123';
rtcClient.join(APP_ID, testChannel, null, 'testuser123');
```

---

## 📱 Platform-Specific Notes

### **Web (Chrome/Firefox):**
- ✅ Fully supported
- ✅ Video/Audio works
- ⚠️ Needs HTTPS for production

### **Mobile (React Native):**
- ⏳ Requires native Agora SDK
- ⏳ Need Expo custom dev client or bare workflow
- ⏳ Additional setup required

---

## 🚀 Next: Enable Call Signaling

To automatically show IncomingCallScreen when someone calls you:

1. **Add RTM listener in CallContext:**
   ```typescript
   rtmEngine.on('MessageFromPeer', (message, peerId) => {
       if (message.text === 'incoming_call') {
           // Show IncomingCallScreen
           setCurrentCall({ ...callData });
           navigation.navigate('IncomingCall');
       }
   });
   ```

2. **Send call notification in startCall():**
   ```typescript
   await rtmEngine.sendMessageToPeer({
       text: 'incoming_call',
       peerId: receiverId
   });
   ```

This will enable real WhatsApp-like call experience!

---

**Happy Testing! 🎉**

