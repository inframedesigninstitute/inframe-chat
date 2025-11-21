# 🔍 DEBUG USER ID MISMATCH

## Problem
Purane messages LEFT side me show ho rahe hain (should be RIGHT).

## Root Cause
Backend me saved `senderId` ≠ AsyncStorage me stored `USERID`

---

## 🧪 Step 1: Check Current USERID

Open browser console and run:

```javascript
// Check what's stored in AsyncStorage
AsyncStorage.getItem('USERID').then(id => {
    console.log('📦 Stored USERID:', id);
    console.log('📦 Type:', typeof id);
});
```

**Expected Output:**
```
📦 Stored USERID: 507f1f77bcf86cd799439011
📦 Type: string
```

---

## 🧪 Step 2: Check Backend Message senderId

Console me ye logs already dikhengi (after clicking on a chat):

```
📨 Message: "Your old message..."
   ├─ Sender ID: "admin_default_001"          ⚠️ Check this
   ├─ Current User: "507f1f77bcf86cd799439011" ⚠️ Compare with this
   ├─ Match: false                             ❌ Not matching!
   └─ isSent: false 👈 LEFT
```

---

## 🎯 Solution Options:

### Option A: Update AsyncStorage USERID (Quick Fix)

If backend messages have senderId like `"admin_default_001"` but AsyncStorage has different ID:

```javascript
// In browser console:
AsyncStorage.setItem('USERID', 'admin_default_001').then(() => {
    console.log('✅ Updated USERID');
    location.reload(); // Refresh page
});
```

### Option B: Check Login Response (Permanent Fix)

1. **Logout** from admin/faculty panel
2. **Open Network Tab** in DevTools
3. **Login again**
4. Check the login API response:

```json
{
  "token": "jwt_token...",
  "userId": "507f1f77bcf86cd799439011",  // ⚠️ This should be saved
  "_id": "507f1f77bcf86cd799439011",      // or this
  "mainAdminId": "507f1f77bcf86cd799439011" // or this
}
```

5. Make sure login screen saves the CORRECT userId

---

## 🔧 Fix Login Screen (If Needed)

### AdminLoginScreen.tsx
Check if userId is being saved correctly after OTP verification:

```typescript
const userId = response.data.userId || 
               response.data.mainAdminId || 
               response.data._id;
               
console.log('🔍 Extracted userId from backend:', userId);

if (userId) {
    await AsyncStorage.setItem('USERID', userId);
    console.log('✅ Saved USERID:', userId);
} else {
    console.error('❌ userId not found in backend response');
}
```

---

## 🧪 Step 3: Verify Backend Messages

Check what backend is returning:

1. Open **Network Tab**
2. Click on any chat
3. Find the `show-msg` API call
4. Check the **Response**:

```json
[
  {
    "_id": "msg_123",
    "senderId": "507f1f77bcf86cd799439011",  // ⚠️ Note this ID
    "senderType": "admin",
    "receiverId": "691d867f...",
    "text": "Your old message"
  }
]
```

Compare `senderId` with your stored `USERID`.

---

## 🎯 Expected Match:

```
Backend senderId:     507f1f77bcf86cd799439011
AsyncStorage USERID:  507f1f77bcf86cd799439011
                      ✅ MATCH → RIGHT side
```

```
Backend senderId:     507f1f77bcf86cd799439011
AsyncStorage USERID:  admin_default_001
                      ❌ NO MATCH → LEFT side (WRONG)
```

---

## 🛠️ Temporary Fix (Testing Only)

If you just want to test, manually set the USERID in console:

```javascript
// Replace with YOUR actual senderId from backend
AsyncStorage.setItem('USERID', '507f1f77bcf86cd799439011').then(() => {
    console.log('✅ USERID updated');
    location.reload();
});
```

---

## 📊 Full Debug Script

Copy-paste this in browser console:

```javascript
(async () => {
    console.log('🔍 === USER ID DEBUG ===');
    
    // Check AsyncStorage
    const storedUserId = await AsyncStorage.getItem('USERID');
    console.log('📦 Stored USERID:', storedUserId);
    
    // Check all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📦 All AsyncStorage Keys:', allKeys);
    
    // Get all values
    for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`   ${key}:`, value?.substring(0, 50) + '...');
    }
    
    console.log('🔍 === END DEBUG ===');
})();
```

---

## ✅ Permanent Solution

Update login screens to save the correct userId:

1. **AdminLoginScreen.tsx** - Line ~120
2. **TeacherLoginScreen.tsx** - Line ~115
3. Make sure to extract userId from backend response correctly

