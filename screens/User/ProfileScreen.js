import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useEffect, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { UserType } from "../../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://10.0.2.2:8000/profile/${userId}`
        );
        const { user } = response.data;
        setUser(user);
        setName(user.name);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const updateProfile = async () => {
    // Regex for password validation
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    // Check if the name, password, or confirm password are empty
    if (!name || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    // Check if password matches the required format
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Password Error",
        "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      );
      return;
    }

    try {
      const response = await axios.put(`http://10.0.2.2:8000/updateprofile`, {
        userId,
        name,
        password,
      });

      await Alert.alert("Success", "Profile updated successfully");

      // Clear text inputs
      setName(user.name);
      setPassword("");
      setConfirmPassword("");

      setUser(response.data.user);
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleLogout = () => {
    clearAuthToken();
  };

  const clearAuthToken = async () => {
    await AsyncStorage.removeItem("authToken");
    console.log("auth token cleared");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={{
              uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
            }}
          />
        </View>

        <View style={{ alignItems: "center", padding: 10 }}>
          <Image
            source={{
              uri: "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png",
            }}
            style={{ height: 200, width: 200, borderRadius: 100 }}
          />
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Name: {user?.name}
          </Text>

          {/* Conditionally display email or phone number based on the method */}
          {user?.method === "email" ? (
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Email: {user?.email}
            </Text>
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Phone: {user?.phoneNumber}
            </Text>
          )}

          <TextInput
            placeholder="New Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={updateProfile}
              style={{
                width: 150,
                backgroundColor: "#FEBE10",
                borderRadius: 6,
                padding: 15,
                alignItems: "center",
                marginRight: 10, // space between buttons
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Update Profile
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("OrderHistory")}
              style={{
                width: 150,
                backgroundColor: "#FEBE10",
                borderRadius: 6,
                padding: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Order History
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    width: "80%",
  },
  header: {
    backgroundColor: "#FEBE10",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
});
