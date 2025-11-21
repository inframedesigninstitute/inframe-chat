# 🐛 Debug Guide: "User type not found" Error

## ⚡ Quick Fix Steps

### Step 1: Clear App Cache & Restart
```bash
# Stop the app (Ctrl+C in terminal)

# Clear Metro bundler cache
npx react-native start --reset-cache

# For Android
npx react-native run-android

# For iOS
npx react-native run-ios
```

### Step 2: Clear AsyncStorage
Open React Native Debugger Console and run:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear everything
AsyncStorage.clear().then(() => console.log("✅ Storage cleared"));

// Or clear specific keys
AsyncStorage.multiRemove(['USERID', 'ADMINTOKEN', 'FACULTYTOKEN'])
  .then(() => console.log("✅ Tokens cleared"));
```

### Step 3: Check Console Logs
When you open a chat, console me ye logs dikhne chahiye:

```
=== FETCH MESSAGES DEBUG ===
Current User ID: admin_default_001
Receiver ID: 691dbaa4d5d52ba86607df4d
Auth Token: Present
Fetching messages from: http://localhost:5200/web/messages/show-msg/691dbaa4d5d52ba86607df4d
Request Body: {
  "userType": "mainAdmin",
  "senderId": "admin_default_001"
}
✅ Fetched Messages: [...]
```

### Step 4: Check Backend
Backend me ye logs dikhne chahiye:
```
Received request:
Body: { userType: 'mainAdmin', senderId: 'admin_default_001' }
Headers: { authorization: 'Bearer ...' }
```

---

## 🔍 Troubleshooting

### Issue 1: "Current User ID: undefined"
**Solution:** Login again to set USERID
```javascript
// Check if USERID is set
AsyncStorage.getItem('USERID').then(id => console.log('USERID:', id));

// If null, login again or manually set
AsyncStorage.setItem('USERID', 'admin_default_001');
```

### Issue 2: "Auth Token: Missing"
**Solution:** Login again to set token
```javascript
// Check token
AsyncStorage.getItem('ADMINTOKEN').then(t => console.log('Token:', t));

// If null, login again
```

### Issue 3: Backend Still Returns "User type not found"
**Solution:** Backend code me request body ko properly access karo

**Wrong (Backend):**
```javascript
const userType = req.user.type; // ❌ JWT se
```

**Correct (Backend):**
```javascript
const userType = req.body.userType; // ✅ Request body se
console.log('Received userType:', userType);
```

### Issue 4: 404 Error
**Solution:** Check API URL
```javascript
// Should be:
const SHOW_MSG_API_URL = "http://localhost:5200/web/messages/show-msg";

// NOT:
const SHOW_MSG_API_URL = "http://localhost:5200/web/messages/show-msgs"; // ❌ typo
```

---

## 🧪 Test Backend API Manually

### Using Postman/Thunder Client:

**Show Messages API:**
```http
POST http://localhost:5200/web/messages/show-msg/691dbaa4d5d52ba86607df4d

Headers:
Content-Type: application/json
Authorization: Bearer <your_token>

Body:
{
  "userType": "mainAdmin",
  "senderId": "admin_default_001"
}
```

**Expected Response (Success):**
```json
{
  "status": 1,
  "messages": [...]
}
```

**Expected Response (Error):**
```json
{
  "error": "User type not found"
}
```

---

## 🔧 Backend Fix (If Needed)

If backend me issue hai, ye fix apply karo:

```javascript
// Backend: routes/messages.js or controller

router.post('/show-msg/:userId', async (req, res) => {
  try {
    // ✅ Get userType from request body
    const { userType, senderId } = req.body;
    const { userId: receiverId } = req.params;
    
    console.log('=== SHOW-MSG API DEBUG ===');
    console.log('User Type:', userType);
    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);
    
    // Validate
    if (!userType) {
      return res.status(400).json({ error: "User type not found" });
    }
    
    if (!['mainAdmin', 'faculty', 'student'].includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }
    
    // Fetch messages
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## ✅ Success Checklist

- [ ] App restarted with cache cleared
- [ ] AsyncStorage cleared
- [ ] Logged in successfully
- [ ] USERID is set in AsyncStorage
- [ ] ADMINTOKEN is set in AsyncStorage
- [ ] Console shows debug logs
- [ ] Backend receives userType in request body
- [ ] API returns 200 status
- [ ] Messages load successfully

---

## 📞 Still Having Issues?

Share these console logs:
1. `=== FETCH MESSAGES DEBUG ===` output
2. `=== FETCH MESSAGES ERROR ===` output (if any)
3. Backend console logs
4. Network tab me request body ka screenshot

