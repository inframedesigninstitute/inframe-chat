// // आपकी नेविगेशन फ़ाइल (जैसे: AppNavigator.tsx)

// import { useNavigation } from '@react-navigation/native'; // Hook for navigation
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ChatListScreen from './ChatListScreen'; // आपकी मुख्य चैट स्क्रीन
// import { ChatMemberAddScreen } from './ChatMemberAddScreen'; // Import the new screen

// const Stack = createNativeStackNavigator();

// const MainStack = () => {
//   const navigation = useNavigation();

//   const handleContactSelection = (contact) => {
//     console.log('Selected Contact for chat:', contact);
//     // 1. New Chat Screen को बंद करें
//     navigation.goBack(); 
//     // 2. Chat detail screen पर navigate करें
//     // navigation.navigate('ChatDetail', { contact: contact }); 
//     Alert.alert("Chat Initiated", `Starting chat with: ${contact.name}`);
//   };

//   return (
//     <Stack.Navigator>
//       {/* आपकी मुख्य स्क्रीन */}
//       <Stack.Screen name="ChatList" component={ChatListScreen} /> 

//       {/* आपकी नई Chat Member Add Screen */}
//       <Stack.Screen 
//         name="NewChatScreen" 
//         options={{ headerShown: false }} // कस्टम हेडर (WhatsApp UI) का उपयोग करने के लिए बिल्ट-इन हेडर छुपा दें
//       >
//         {/* props पास करने के लिए function का इस्तेमाल करें */}
//         {() => (
//           <ChatMemberAddScreen 
//             onContactSelect={handleContactSelection} 
//             onGoBack={() => navigation.goBack()} // Back navigation logic
//           />
//         )}
//       </Stack.Screen>
//     </Stack.Navigator>
//   );
// };

// export default MainStack;