import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
  Switch,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { UserType } from "../../UserContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddAdressScreen = () => {
  //navigation
  const navigation = useNavigation();
  // UseState
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const { userId, setUserId } = useContext(UserType);
  const [status, setStatus] = useState("not the default"); // actual status

  console.log(userId);

  const url = "http://10.0.2.2:8000/addresses";

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  const handleMobileNumberChange = (text) => {
    // Remove all non-digit characters (except for + and spaces)
    const cleanedText = text.replace(/[^0-9\s+]/g, "");

    // Check if the number starts with +60 or is empty
    if (cleanedText.startsWith("+60")) {
      setMobileNumber(cleanedText); // Keep the value as is
    } else if (cleanedText.length > 0) {
      setMobileNumber("+60 " + cleanedText); // Prepend +60
    } else {
      setMobileNumber(""); // Empty input, reset
    }
    console.log(mobileNumber);
  };

  const handleAddAddress = () => {
    const phoneRegex = /^\+60\s?\d{8,10}$/; // Matches +60 followed by 8-10 digits

    if (!phoneRegex.test(mobileNumber)) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid Malaysian number (e.g., +60 182540219)"
      );
      return;
    }

    // Validate input fields
    if (
      !mobileNumber ||
      !houseNo ||
      !street ||
      !landmark ||
      !city ||
      !country ||
      !postalCode
    ) {
      Alert.alert(
        "Address Required",
        "Please complete all address fields before proceeding."
      );
      return; // Stop execution if validation fails
    }

    const address = {
      name,
      status,
      mobileNumber,
      houseNo,
      street,
      landmark,
      city,
      country,
      postalCode,
    };

    axios
      .post(url, { userId, address })
      .then((response) => {
        Alert.alert("Success", "Addresses added successfully");
        setName("");
        setStatus("");
        setMobileNumber("");
        setHouseNo("");
        setStreet("");
        setLandmark("");
        setCountry("");
        setCity("");
        setPostalCode("");

        // Navigate back after 500ms
        setTimeout(() => {
          navigation.goBack(); // This will trigger useFocusEffect on AddressScreen
        }, 500);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to add address");
        console.log("error", error);
      });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://10.0.2.2:8000/profile/${userId}`
        );
        const { user } = response.data;
        setName(user.name); //Set User Name
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
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
      {/* Adress */}
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold", textAlign: "center" }}>
          Add a new Address
        </Text>

        {/* Name */}
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Full name (First and last name)
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            placeholder={name}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            editable={false}
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Mobile Number
          </Text>
          <TextInput
            value={mobileNumber}
            onChangeText={handleMobileNumberChange}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Mobile No "
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Flat,House No,Building,Company
          </Text>
          <TextInput
            value={houseNo}
            onChangeText={(text) => setHouseNo(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder=""
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Area,Street,sector,village
          </Text>
          <TextInput
            value={street}
            onChangeText={(text) => setStreet(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder=""
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Landmark</Text>
          <TextInput
            value={landmark}
            onChangeText={(text) => setLandmark(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Eg near appollo hospital"
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>City</Text>
          <TextInput
            value={city}
            onChangeText={(text) => setCity(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Puchong"
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Country</Text>
          <TextInput
            value={country}
            onChangeText={(text) => setCountry(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Malaysia"
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Postalcode</Text>
          <TextInput
            value={postalCode}
            onChangeText={(text) => setPostalCode(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Enter Postalcode"
          />
        </View>

        <Pressable
          onPress={handleAddAddress}
          style={{
            backgroundColor: "#FFC72C",
            padding: 19,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Add Address</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddAdressScreen;

const styles = StyleSheet.create({
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
});
