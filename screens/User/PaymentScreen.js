import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { UserType } from "../../UserContext";
import { BackHandler } from "react-native";


const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { userId } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart);
  const defaultAddress = useSelector((state) => state.address?.defaultAddress);

 // Handle Android back button to navigate to Cart
 useFocusEffect(
  React.useCallback(() => {
    const backAction = () => {
      navigation.navigate("Cart");
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup
  }, [])
);
  const totalPrice = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  const handlePayment = async () => {
    if (!defaultAddress) {
      Alert.alert("Error", "No shipping address found.");
      return;
    }

    const transformedAddress = {
      name: defaultAddress.name,
      mobileNumber: defaultAddress.mobileNumber,
      houseNo: defaultAddress.houseNo,
      street: defaultAddress.street,
      landmark: defaultAddress.landmark,
      postalCode: defaultAddress.postalCode,
    };

    navigation.navigate("PayPalWebView", {
      totalPrice,
      userId,
      cartItems: cart,
      shippingAddress: transformedAddress,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay with PayPal</Text>
      <Text style={styles.summary}>Amount to Pay: RM{totalPrice}</Text>

      <Pressable
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>Confirm Payment</Text>
        )}
      </Pressable>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  summary: {
    fontSize: 18,
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: "#003087",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  payText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
