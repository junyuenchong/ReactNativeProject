import React, { useRef } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setCart } from "../../redux/CartReducer";

const PayPalWebView = ({ navigation, route }) => {
  const { totalPrice, userId, cartItems, shippingAddress } = route.params;
  const webviewRef = useRef(null);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.navigate("Cart");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleStartRequest = (request) => {
    const { url } = request;

    if (url.includes("success.payment")) {
      // Create order only if payment is successful
      axios
        .post("http://10.0.2.2:8000/orders", {
          userId,
          cartItems,
          totalPrice,
          shippingAddress,
          paymentMethod: "PayPal",
        })
        .then(() => {
          dispatch(setCart([])); // Clear cart
          navigation.replace("OrderSuccess");
        })
        .catch((error) => {
          console.error("Order creation failed:", error);
          Alert.alert("Error", "Order creation failed after payment.");
          navigation.navigate("Cart");
        });

      return false;
    }

    if (url.includes("cancel.payment")) {
      navigation.navigate("Cart");
      return false;
    }

    return true;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <WebView
        ref={webviewRef}
        source={{ uri: `http://10.0.2.2:8000/paypal?amount=${totalPrice}` }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={handleStartRequest}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        onError={(e) => {
          console.warn("WebView Error:", e.nativeEvent);
          Alert.alert("Error", "Failed to load PayPal.");
        }}
        onHttpError={(e) => {
          console.warn("WebView HTTP Error:", e.nativeEvent);
          Alert.alert("HTTP Error", `Status: ${e.nativeEvent.statusCode}`);
        }}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

export default PayPalWebView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
