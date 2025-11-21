# 📞 Faculty & Student Call Setup Instructions

## ✅ What's Already Done:

1. ✅ LiveVideoCall.tsx copied to Faculty & Student
2. ✅ AudioCallScreen.tsx copied to Faculty & Student  
3. ✅ Token keys updated (FACULTYTOKEN, STUDENTTOKEN)
4. ✅ User ID fallbacks updated (faculty_, student_)

---

## 🔧 Remaining Setup:

### **Faculty/components/FacultyChatThread.tsx**

Add these functions after `fetchMessages`:

```typescript
// ✅ Handle Video Call
const handleVideoCall = async () => {
    try {
        console.log('📹 Faculty: Starting video call with:', channel.name);
        
        const callChannelName = `call_${currentUserId}_${channel.id}_${Date.now()}`;
        
        // Send RTM notification
        if (rtmEngine) {
            const callData = {
                type: 'video_call',
                callerId: currentUserId,
                callerName: 'Faculty',
                channelName: callChannelName,
                timestamp: Date.now(),
            };
            
            try {
                await rtmEngine.sendMessageToPeer({
                    text: JSON.stringify(callData),
                }, channel.id);
                console.log('✅ Call notification sent');
            } catch (rtmError) {
                console.error('❌ RTM send error:', rtmError);
            }
        }
        
        // Navigate to LiveVideoCall
        navigation.navigate('LiveVideoCall', { channelName: callChannelName });
        
    } catch (error: any) {
        console.error('❌ Video call error:', error);
        Alert.alert('Call Failed', 'Unable to start video call');
    }
};

// ✅ Handle Audio Call
const handleAudioCall = async () => {
    try {
        console.log('📞 Faculty: Starting audio call with:', channel.name);
        
        const callChannelName = `call_${currentUserId}_${channel.id}_${Date.now()}`;
        
        // Send RTM notification
        if (rtmEngine) {
            const callData = {
                type: 'audio_call',
                callerId: currentUserId,
                callerName: 'Faculty',
                channelName: callChannelName,
                timestamp: Date.now(),
            };
            
            try {
                await rtmEngine.sendMessageToPeer({
                    text: JSON.stringify(callData),
                }, channel.id);
                console.log('✅ Call notification sent');
            } catch (rtmError) {
                console.error('❌ RTM send error:', rtmError);
            }
        }
        
        // Navigate to AudioCall
        navigation.navigate('AudioCall', { 
            contactName: channel.name,
            contactNumber: channel.id,
        });
        
    } catch (error) {
        console.error('❌ Audio call error:', error);
        Alert.alert('Call Failed', 'Unable to start audio call');
    }
};
```

### **Update RTM Listener (Faculty)**

Find `engine.addListener("MessageReceived"` and replace with:

```typescript
engine.addListener("MessageReceived", (event: MessageEvent) => {
    const msg = event as any;

    try {
        // ✅ Check if this is a call notification
        const messageText = msg.text || msg.message || "";
        const callData = JSON.parse(messageText);
        
        if (callData.type === 'video_call' || callData.type === 'audio_call') {
            console.log('📞 Faculty: Incoming call notification:', callData);
            
            // Show alert for incoming call
            Alert.alert(
                `Incoming ${callData.type === 'video_call' ? 'Video' : 'Audio'} Call`,
                `${callData.callerName} is calling you`,
                [
                    {
                        text: 'Decline',
                        style: 'cancel',
                    },
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
        // Not a call notification, treat as regular message
    }

    // Regular text message handling
    const incomingMsg: Message = {
        id: Date.now().toString(),
        text: msg.text || msg.message || "New message",
        isSent: false,
        timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        status: "delivered",
    };

    setMessages(prev => [...prev, incomingMsg]);
    
    if (onNewMessage) {
        onNewMessage(channel.id, msg.text || msg.message || "New message");
    }
});
```

### **Update Header Buttons (Faculty)**

Find the headerActions section and update:

```typescript
<View style={styles.headerActions}>
    {/* Video Call Button */}
    <TouchableOpacity
        style={styles.actionButton}
        onPress={handleVideoCall}
    >
        <Ionicons name="videocam" size={24} color="#000" />
    </TouchableOpacity>
    
    {/* Audio Call Button */}
    <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleAudioCall}
    >
        <Ionicons name="call" size={24} color="#000" />
    </TouchableOpacity>
</View>
```

---

## 🎓 **Student Same Setup:**

Student ke liye bhi same code copy karo, bas ye changes:

### **Students/components/ChatThread.tsx:**

1. **Caller name:** `"Student"` instead of `"Faculty"`
2. **Token:** `STUDENTTOKEN` (already using)
3. **User ID:** `USERID` (already using)

Same functions:
- `handleVideoCall()`
- `handleAudioCall()`  
- RTM listener update
- Header buttons

---

## 🧪 **Testing:**

### **Faculty → Admin Call:**
```bash
Browser 1: Faculty Login
Browser 2: Admin Login

Faculty clicks 📹
Admin sees alert
Admin clicks Accept
Both in video call! ✅
```

### **Student → Faculty Call:**
```bash
Browser 1: Student Login
Browser 2: Faculty Login

Student clicks 📞
Faculty sees alert
Faculty clicks Accept
Both in audio call! ✅
```

---

## 📋 **Quick Copy Commands:**

```bash
# If you want to copy Admin ChatThread call handling:

# 1. Copy handleVideoCall & handleAudioCall functions
# 2. Copy RTM listener call detection
# 3. Update button onPress handlers
# 4. Change "Admin" to "Faculty" or "Student"
# 5. Use FACULTYTOKEN or STUDENTTOKEN
```

---

## ✅ **Expected Result:**

| User Type | Video Call | Audio Call | Receive Call |
|-----------|------------|------------|--------------|
| Admin | ✅ Working | ✅ Working | ✅ Working |
| Faculty | ✅ After setup | ✅ After setup | ✅ After setup |
| Student | ✅ After setup | ✅ After setup | ✅ After setup |

---

**Files to Update:**
1. `/src/Faculty/components/FacultyChatThread.tsx`
2. `/src/Students/components/ChatThread.tsx`

**Changes:**
- Add `handleVideoCall()` function
- Add `handleAudioCall()` function
- Update RTM listener for incoming calls
- Update header button `onPress` handlers

**Copy from:** `/src/Admin/components/ChatThread.tsx` (lines 282-397)

---

**Done! 🎉**

