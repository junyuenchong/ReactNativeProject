import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserType } from "../../UserContext";
import { AntDesign, Entypo } from "@expo/vector-icons";
const EditAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { address } = route.params;
  const { userId } = useContext(UserType);
  const [form, setForm] = useState({
    name: address.name,
    mobileNumber: address.mobileNumber,
    houseNo: address.houseNo,
    street: address.street,
    landmark: address.landmark,
    city: address.city,
    country: address.country,
    postalCode: address.postalCode,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {

      // Check for empty fields
  const emptyFields = Object.entries(form).filter(([_, value]) => value.trim() === "");

  if (emptyFields.length > 0) {
    Alert.alert("Validation Error", "Please fill out all fields.");
    return;
  }

    try {
      await axios.put(
        `http://10.0.2.2:8000/updateaddresses/${userId}/${address._id}`,
        { address: form }
      );
      Alert.alert("Success", "Address updated successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update address");
    }
  };

  return (
   
    <View style={{ flex: 1, }}>
    {/* Header with Logo and Back */}
    <View style={styles.header}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </Pressable>
      <Image
        style={styles.logo}
        source={{
          uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
        }}
      />
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>Edit Address</Text>

      {Object.entries(form).map(([key, value]) => (
        <TextInput
          key={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={value}
          onChangeText={(text) => handleChange(key, text)}
          style={styles.input}
        />
      ))}

      <Pressable onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </ScrollView>
  </View>
);
};


export default EditAddressScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  header: {
    backgroundColor: "#FEBE10",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 15,
    zIndex: 1,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#FEBE10",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveText: {
    fontWeight: "bold",
  },
});