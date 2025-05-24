import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";

const ResetPasswordScreen = ({ navigation }) => {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const sendResetCode = async () => {
    if (method === "email" && !email.trim()) {
      Alert.alert("Validation Error", "Please enter your email");
      return;
    }
    if (method === "phone" && !phone.trim()) {
      Alert.alert("Validation Error", "Please enter your phone number");
      return;
    }

    const fullPhone = "+60" + phone.replace(/^0/, "");
    try {
      await axios.post("http://10.0.2.2:8000/send-reset-code", {
        method,
        email: method === "email" ? email : undefined,
        phone: method === "phone" ? fullPhone : undefined,
      });
      setIsCodeSent(true);
      Alert.alert("Success", `Reset code sent via ${method}`);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to send code"
      );
    }
  };

  const resetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    // Regex for password validation
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // Check if password matches the required format
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Password Error",
        "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      );
      return;
    }

    const fullPhone = "+60" + phone.replace(/^0/, "");

    try {
      const res = await axios.post("http://10.0.2.2:8000/reset-password", {
        method,
        email: method === "email" ? email : undefined,
        phone: method === "phone" ? fullPhone : undefined,
        code,
        newPassword,
      });
      Alert.alert("Success", res.data.message);
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to reset password"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={{
            uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
          }}
        />
        <Text style={styles.heading}>Reset Your Password</Text>
      </View>

      <KeyboardAvoidingView behavior="padding">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#D0D0D0",
            paddingVertical: 5,
            borderRadius: 5,
            marginTop: 30,
          }}
        >
          {/*  Email Logo*/}
          <AntDesign
            style={{ marginLeft: 8 }}
            name="lock1"
            size={24}
            color="black"
          />

          {method === "email" ? (
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          ) : (
            // Wrap both components inside a View or Fragment
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>+60</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          )}
        </View>
        <Pressable style={styles.sendCodeButton} onPress={sendResetCode}>
          <Text style={styles.buttonText}>Send Reset Code</Text>
        </Pressable>

        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setMethod("email")}
            style={[
              styles.toggleBtn,
              method === "email" && styles.activeToggleBtn,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                method === "email" && styles.activeToggleText,
              ]}
            >
              Email
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMethod("phone")}
            style={[
              styles.toggleBtn,
              method === "phone" && styles.activeToggleBtn,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                method === "phone" && styles.activeToggleText,
              ]}
            >
              Phone
            </Text>
          </Pressable>
        </View>
        {isCodeSent && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter reset code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable style={styles.resetButton} onPress={resetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  logo: {
    width: 150,
    height: 100,
    marginTop: 30,
    resizeMode: "contain",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#041E42",
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    color: "gray",
    width: "80%",
    paddingLeft: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // aligns buttons to the right
    alignItems: "center", // optional: aligns items vertically
    marginVertical: 10,
  },
  toggleBtn: {
    borderWidth: 1,
    borderColor: "#007FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeToggleBtn: {
    backgroundColor: "#007FFF",
  },
  toggleText: {
    fontSize: 16,
    color: "#007FFF",
  },
  activeToggleText: {
    color: "white",
    fontWeight: "bold",
  },
  sendCodeButton: {
    backgroundColor: "#FEBE10",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    marginTop: 15,
  },
  resetButton: {
    backgroundColor: "#FEBE10",
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
