// npx expo start --tunnel
import {
  SafeAreaView,
  StyleSheet,
  Image,
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const LoginScreen = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Toggle state for Admin/User
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const [adminToken, userToken] = await Promise.all([
          AsyncStorage.getItem("authAdminToken"),
          AsyncStorage.getItem("authToken"),
        ]);

        if (adminToken) {
          navigation.replace("AdminPage"); // Admin home
        } else if (userToken) {
          navigation.replace("Main"); // User home
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      }
    })();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authAdminToken");

        if (token) {
          navigation.replace("AdminPage");
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkAdminStatus();
  }, []);

  // Login Function
  const handleLogin = () => {
    if (!loginId) {
      Alert.alert(
        "Validation Error",
        "Please enter your email, phone, or username."
      );
      return;
    }

    if (!password) {
      Alert.alert("Validation Error", "Please enter your password.");
      return;
    }

    const user = {
      email: loginId,
      name: loginId,
      phone: loginId,
      password: password,
    };

    axios
      .post("http://10.0.2.2:8000/login", user)
      .then((response) => {
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);
        navigation.replace("Main");
      })
      .catch((error) => {
        const message =
          error.response?.data?.message === "Invalid password"
            ? "Incorrect password."
            : "Invalid login credentials.";
        Alert.alert("Login Error", message);
        console.log(error);
      });
  };

  const handleAdminLogin = () => {
    // print("hello");
    if (!loginId || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    const admin = {
      email: loginId,
      name: loginId,
      phone: loginId,
      password: password,
    };

    axios
      .post("http://10.0.2.2:8000/adminlogin", admin)
      .then((response) => {
        const token = response.data.token;
        AsyncStorage.setItem("authAdminToken", token);
        navigation.replace("AdminPage");
      })
      .catch((error) => {
        const msg = error?.response?.data?.message || "Unknown error";
        Alert.alert("Login Error", msg);
        console.log("Admin login error:", msg);
      });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View>
        {/*  Image  Logo*/}
        <Image
          style={{
            width: 150,
            height: 100,
            marginTop: 30,
            justifyContent: "center",
          }}
          source={{
            uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
          }}
        />
      </View>

      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          {/* Login Screen Text */}
          <Text style={{ fontSize: 17, fontWeight: "bold", color: "#041E42" }}>
            Login In your Account
          </Text>
        </View>

        <View
          style={{
            marginTop: 70,
          }}
        >
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
            <Fontisto
              style={{ marginLeft: 8 }}
              name="email"
              size={24}
              color="black"
            />

            {/* Email Text Input*/}
            <TextInput
              value={loginId}
              onChangeText={(text) => setLoginId(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                paddingLeft: 10,
                width: "80%",
                fontSize: 16,
              }}
              placeholder="Enter email, phone, or username"
            />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
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
            {/*  Passwprd  Logo*/}
            <AntDesign
              style={{ marginLeft: 8 }}
              name="lock1"
              size={24}
              color="black"
            />

            {/* Email Text Input*/}
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={{
                color: "gray",
                marginVertical: 10,
                width: "80%",
                fontSize: password ? 16 : 16,
                paddingLeft: 10,
              }}
              placeholder="enter your Password"
            />
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "space-between",
          }}
        >
          <Text>Keep me logged in</Text>
          <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={{ color: "#007FFF", fontWeight: "500" }}>
              Forgot Password
            </Text>
          </Pressable>
        </View>

        {/* Space Button */}
        <View style={{ marginTop: 10, flexDirection: "row" }}>
          {/* Login Buttons */}
          {isAdmin ? (
            <Pressable
              onPress={handleAdminLogin}
              style={{
                width: 150,
                backgroundColor: "#FEBE10",
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
                padding: 15,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Admin Login
              </Text>
            </Pressable>
          ) : ( 
            <Pressable
              onPress={handleLogin}
              style={{
                width: 150,
                backgroundColor: "#FEBE10",
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
                padding: 15,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                User Login
              </Text>
            </Pressable>
          )}
          <View style={{ marginLeft: 70 }} />
          <Pressable
            onPress={() => setIsAdmin(false)}
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: !isAdmin ? "#FEBE10" : "transparent",
              borderRadius: 50, // Makes the button circular
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: !isAdmin ? "white" : "black",
              }}
            >
              User
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsAdmin(true)}
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: isAdmin ? "#FEBE10" : "transparent",
              borderRadius: 50, // Makes the button circular
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: isAdmin ? "white" : "black",
              }}
            >
              Admin
            </Text>
          </Pressable>
        </View>

        {/* Navigation links */}
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 15, flexDirection: "row", marginLeft: 150 }}
        >
          <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
            Don't have an account? Sign Up
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("AdminPage")}
          style={{ marginTop: 15 }}
        >
          <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
            Admin Login
          </Text>
        </Pressable>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
