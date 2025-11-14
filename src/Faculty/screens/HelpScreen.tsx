import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const HelpScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Help & Support</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📩 Support Email</Text>
          <Text style={styles.cardText}>support@sjestapp.com</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📞 Customer Support</Text>
          <Text style={styles.cardText}>+91 98765 43210</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👨‍💼 Admin / Technical Support</Text>
          <Text style={styles.cardText}>+91 91234 56780</Text>
          <Text style={styles.cardText}>admin@sjestapp.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.link}>Terms & Conditions</Text>
          <Text style={styles.link}>Privacy Policy</Text>
          <Text style={styles.link}>Application Info</Text>
        </View>

        <Text style={styles.footerText}>Version 1.0.0 • SJEST Chat App</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dbd1d1ff",
    padding: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    color: "#000000ff",
    textShadowColor: "#000000ff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  card: {
    backgroundColor: "#bbb0b0ff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#00000055",
    shadowColor: "#000000ff",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000ff",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 16,
    color: "#000000ff",
    marginVertical: 2,
  },

  section: {
    marginTop: 20,
    padding: 10,
  },

  link: {
    fontSize: 17,
    color: "#010202ff",
    marginVertical: 10,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  footerText: {
    textAlign: "center",
    color: "#000000ff",
    marginTop: 30,
    marginBottom: 20,
    fontSize: 13,
  },
});
