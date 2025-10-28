import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function QuizPollModal({ visible, onClose }) {
  const [type, setType] = useState("poll"); // "poll" or "quiz"
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    console.log({ type, question, options });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Create {type === "poll" ? "Poll" : "Quiz"}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter question"
            value={question}
            onChangeText={setQuestion}
          />

          {options.map((opt, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChangeText={(text) => handleOptionChange(text, index)}
            />
          ))}

          <TouchableOpacity style={styles.button} onPress={addOption}>
            <Text style={{ color: "#fff" }}>Add Option</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={{ color: "#fff" }}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "gray", marginLeft: 10 }]}
              onPress={onClose}
            >
              <Text style={{ color: "#fff" }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity onPress={() => setType("poll")}>
              <Text style={{ marginRight: 20, color: type === "poll" ? "blue" : "black" }}>Poll</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType("quiz")}>
              <Text style={{ color: type === "quiz" ? "blue" : "black" }}>Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginVertical: 5, borderRadius: 5 },
  button: { backgroundColor: "#607D8B", padding: 10, borderRadius: 5 },
});
