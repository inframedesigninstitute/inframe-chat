

import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Provider } from "react-redux";
import AdminApp from "../src/Admin/App";
import FacultyApp from "../src/Faculty/App";
import store from "../src/Redux/Store/store"; // ✅ FIX: correct relative path
import StudentApp from "../src/Students/App";

const App = () => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  return (
    <Provider store={store}>
      {selectedApp === "admin" ? (
        <AdminApp />
      ) : selectedApp === "faculty" ? (
        <FacultyApp />
      ) : selectedApp === "student" ? (
        <StudentApp />
      ) : (
        <View style={styles.container}>
          <Image
            source={require("../src/assets/InframeLogo001.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.heading}>Welcome to Inframe</Text>

          <View style={styles.buttonsWrap}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setSelectedApp("faculty")}
            >
              <Text style={styles.outlineButtonText}>Faculty Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setSelectedApp("student")}
            >
              <Text style={styles.outlineButtonText}>Student Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setSelectedApp("admin")}
            >
              <Text style={styles.outlineButtonText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  buttonsWrap: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "80%",
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
