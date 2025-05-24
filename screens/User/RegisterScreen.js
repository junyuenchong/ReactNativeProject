import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Alert,
} from "react-native";
import React, { useRef, useState } from "react";
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import PhoneInput from "react-native-phone-number-input";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isPhoneVerification, setIsPhoneVerification] = useState(false);

  const phoneInputRef = useRef(null);
  const navigation = useNavigation();

  const registerUrl = "http://10.0.2.2:8000/register";
  const sendCodeUrl = "http://10.0.2.2:8000/send-code";

  const sendCodeToVerificationMethod = async () => {
    const method = isPhoneVerification ? "phone" : "email";
    const fullPhone = "+60" + phone.replace(/^0/, ""); // Ensure correct format
  
    if ((method === "email" && !email) || (method === "phone" && (!fullPhone || fullPhone.length < 10))) {
      Alert.alert("Validation Error", `Please enter a valid ${method}.`);
      return;
    }
  
    try {
      const response = await axios.post(sendCodeUrl, {
        email,
        phone: fullPhone,
        method,
      });
      setGeneratedCode(response.data.code);
      setIsCodeSent(true);
      Alert.alert("Success", `Verification code sent via ${method}.`);
    } catch (error) {
      console.error("Error sending code:", error);
      Alert.alert("Error", "Failed to send verification code.");
    }
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setVerificationCode("");
    setIsCodeSent(false);
    setEmailError("");
  };

  const handleRegister = () => {
    const method = isPhoneVerification ? "phone" : "email"; // Dynamically set method
  
    const fullPhone = "+60" + phone.replace(/^0/, ""); // Correct phone format for Malaysia
   // Regex for password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // Check if password matches the required format
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Password Error",
        "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      );
      return;
    }
    if (!name || (!email && !phone) || !password || !verificationCode) {
      Alert.alert("Validation Error", "All fields including verification code are required.");
      return;
    }
  
    if (verificationCode !== generatedCode) {
      Alert.alert("Invalid Code", "The verification code is incorrect.");
      return;
    }
  
    axios
      .post(registerUrl, {
        name,
        email,
        phone: fullPhone,
        password,
        method, // Send the method (email or phone)
      })
      .then((res) => {
        Alert.alert("Success", res.data.message);
        resetForm();
        navigation.navigate("Login");
      })
      .catch((error) => {
        const message = error.response?.data?.message || "Something went wrong.";
        if (message === "This email is already registered.") {
          setEmailError(message);
        }
        Alert.alert("Registration Error", message);
        console.error("Registration failed:", error.response?.data || error.message);
      });
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
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Text style={styles.headerText}>Register to your Account</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              style={styles.icon}
              name="person-sharp"
              size={24}
              color="black"
            />
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your name"
            />
          </View>

          {!isPhoneVerification ? (
            <View style={styles.inputContainer}>
              <MaterialIcons
                style={styles.icon}
                name="email"
                size={24}
                color="gray"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <MaterialIcons
                style={styles.icon}
                name="phone"
                size={24}
                color="gray"
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          )}

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <Pressable
            onPress={sendCodeToVerificationMethod}
            style={styles.sendCodeButton}
          >
            <Text style={styles.registerButtonText}>
              Send Verification Code via {isPhoneVerification ? "SMS" : "Email"}
            </Text>
          </Pressable>

          {isCodeSent && (
            <View style={styles.inputContainer}>
              <MaterialIcons
                style={styles.icon}
                name="confirmation-number"
                size={24}
                color="gray"
              />
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter verification code"
                style={styles.input}
                keyboardType="number-pad"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <AntDesign
              name="lock1"
              size={24}
              color="gray"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter your password"
            />
          </View>

          <Pressable onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.loginRedirect}
          >
            <Text style={styles.loginRedirectText}>
              Already have an account? Sign In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsPhoneVerification(!isPhoneVerification)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              Switch to {isPhoneVerification ? "Email" : "Phone"} Verification
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    marginTop: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 100,
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  formContainer: {
    width: "80%",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D0D0D0",
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 15,
  },
  icon: {
    marginLeft: 8,
  },
  input: {
    color: "gray",
    marginVertical: 10,
    width: "100%",
    fontSize: 16,
    paddingLeft: 8,
  },
  headerText: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 12,
    color: "#041E42",
  },
  sendCodeButton: {
    backgroundColor: "#007FFF",
    padding: 10,
    borderRadius: 6,
    marginTop: 30,
    width: 200,
    alignSelf: "center",
  },
  registerButton: {
    width: 200,
    backgroundColor: "#FEBE10",
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    padding: 15,
    marginTop: 50,
  },
  registerButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    textAlign: "center",
  },
  loginRedirect: {
    marginTop: 15,
  },
  loginRedirectText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    width: 250,
    alignSelf: "center",
  },
  toggleButtonText: {
    color: "#007FFF",
    textAlign: "center",
  },
  countryCodeButton: {
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    paddingVertical: 8,
    borderRadius: 5,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
  },
});
