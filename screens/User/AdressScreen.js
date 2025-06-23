import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { UserType } from "../../UserContext";
import axios from "axios";

const AddressScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const { userId } = useContext(UserType);
  const [selectedAddressId, setSelectedAddressId] = useState("");


  useFocusEffect(
    useCallback(() => {
      if (userId) fetchAddresses();
    }, [userId])
  );  

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `https://reactnativeproject.onrender.com/addresses/${userId}`
      );
      const { addresses } = response.data;
      setAddresses(addresses);
      const defaultAddress = addresses.find(
        (addr) => addr.status === "default" // Or `addr.isDefault === true`
      );

      if (defaultAddress) setSelectedAddressId(defaultAddress._id);
    } catch (error) {
      console.log("error", error);
    }
  };

  const updateDefaultAddress = async (addressId) => {
    try {
      await axios.put(`https://reactnativeproject.onrender.com/addresses/default/${userId}`, {
        addressId,
      });
      setSelectedAddressId(addressId); // update UI immediately

      fetchAddresses(); // refresh from backend
    } catch (error) {
      console.log("Error updating default address", error);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await axios.delete(
        `https://reactnativeproject.onrender.com/addresses/${userId}/${addressId}`
      );
      alert("remove successfully");
      fetchAddresses(); // refresh after deletion
    } catch (error) {
      console.log("Error deleting address", error);
    }
  };

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

      <View style={styles.container}>
        <Text style={styles.title}>My Address</Text>

        <View style={{ alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("AddAddress")}
            style={styles.addAddressButton}
          >
            <Text style={{ fontWeight: "bold" }}>+ Add address</Text>
          </Pressable>
        </View>

        {addresses.length === 0 ? (
          <Text style={styles.emptyText}>
            No addresses found. Please add a new address.
          </Text>
        ) : (
          addresses.map((item) => (
            <View key={item._id} style={styles.addressCard}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Entypo name="location-pin" size={20} color="red" />
                {item.status === "default" && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}
              </View>

              <Text style={styles.text}>{item.houseNo}</Text>
              <Text style={styles.text}>{item.street}</Text>
              <Text style={styles.text}>Malaysia</Text>
              <Text style={styles.text}>Phone No: {item.mobileNumber}</Text>
              <Text style={styles.text}>Postal Code: {item.postalCode}</Text>

              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditAddress", {
                      address: item,
                      userId: userId,
                    })
                  }
                >
                  <Text>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => deleteAddress(item._id)}
                >
                  <Text>Remove</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.actionButton,
                    item._id === selectedAddressId && {
                      backgroundColor: "#FBCEB1",
                    },
                  ]}
                  onPress={() => updateDefaultAddress(item._id)}
                >
                  <Text>
                    {item._id === selectedAddressId
                      ? "Selected"
                      : "Set as Default"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
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
  container: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addAddressButton: {
    width: 385,
    height: 50,
    borderColor: "#D0D0D0",
    borderRadius: 50,
    marginTop: 10,
    borderWidth: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  addressCard: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
    marginLeft: 8,
  },
  text: {
    fontSize: 15,
    color: "#181818",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
});
