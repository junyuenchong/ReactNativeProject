import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/CartReducer";
import axios from "axios";
import { UserType } from "../../UserContext";

const API_BASE_URL = "http://10.0.2.2:8000";

const ProductInfoScreen = () => {
  const route = useRoute();
  const { width } = Dimensions.get("window");
  const height = (width * 100) / 100;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { userId } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart);

  const addItemToCart = async () => {
    if (isAdding || !userId || !cart) return;

    setIsAdding(true);
    setAddedToCart(true);

    try {
      const productId = route?.params?.id;
      const productColor = route?.params?.color;
      const productSize = route?.params?.size;

      const existingProduct = cart.find(
        (item) =>
          item.id === productId &&
          item.color === productColor &&
          item.size === productSize
      );

      const oldQuantity = existingProduct ? existingProduct.quantity : 0;

      const product = {
        id: productId,
        title: route?.params?.title,
        image: route?.params?.carouselImages[0],
        price: Number(route?.params?.price),
        quantity: oldQuantity + quantity,
        color: productColor,
        size: productSize,
      };

      dispatch(addToCart(product));

      const response = await axios.post(`${API_BASE_URL}/user/cart`, {
        userId,
        product,
      });

      if (response.status === 200) {
        console.log("✅ Product synced with backend:", response.data.cart);
      } else {
        Alert.alert("Cannot add product", "Unexpected response from server.");
        console.warn("⚠️ Unexpected response while syncing with backend");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Show backend validation message or default
        Alert.alert(
          "Cannot add product",
          err.response.data.message || "Invalid product data."
        );
      } else {
        Alert.alert("Cannot add product", "Failed to sync with backend.");
        console.error("❌ Failed to sync with backend", err);
      }
    } finally {
      setTimeout(() => {
        setAddedToCart(false);
        setIsAdding(false);
      }, 1500);
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
      style={{ flex: 1, backgroundColor: "white" }}
      showsHorizontalScrollIndicator={false}
    >

      {/* Product Images */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {route.params.carouselImages.map((item, index) => (
          <ImageBackground
            style={{ width, height, marginTop: 25, resizeMode: "contain" }}
            source={{ uri: item }}
            key={index}
          >
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#C60C30",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  20% off
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E0E0E0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color="black"
                />
              </View>
            </View>

            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E0E0E0",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 20,
                marginBottom: 20,
                marginTop: "auto",
              }}
            >
              <AntDesign name="hearto" size={24} color="black" />
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Product Info */}
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: "bold" }}>
          {route?.params?.title}
        </Text>
      </View>

      <Text style={{ height: 1, borderColor: "#D0D0D0", borderWidth: 1 }} />

      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Product Description :</Text>
      </View>

      <View style={{ flexDirection: "row", padding: 10 }}>
        <Text>Color: </Text>
        <Text style={{ fontWeight: "bold" }}>{route?.params?.color}</Text>
      </View>

      <View style={{ flexDirection: "row", padding: 10 }}>
        <Text>Size: </Text>
        <Text style={{ fontWeight: "bold" }}>{route?.params?.size}</Text>
      </View>

      {/* Quantity selector */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
        <Pressable
          onPress={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 5,
          }}
        >
          <Text style={{ fontSize: 20 }}>-</Text>
        </Pressable>

        <Text style={{ marginHorizontal: 20, fontSize: 18 }}>{quantity}</Text>

        <Pressable
          onPress={() => setQuantity((q) => q + 1)}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 5,
          }}
        >
          <Text style={{ fontSize: 20 }}>+</Text>
        </Pressable>
      </View>

      <Text style={{ height: 1, borderColor: "#D0D0D0", borderWidth: 1 }} />

      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: "bold", marginVertical: 5 }}>
          Total : RM {route.params.price}
        </Text>
        <Text style={{ color: "#00CED1" }}>
          FREE delivery Tomorrow by 3 PM. Order within 10hrs 30 mins
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginVertical: 5,
            alignItems: "center",
            gap: 5,
          }}
        >
          <Ionicons name="location" size={24} color="black" />
          <Text style={{ fontWeight: "500" }}>
            Deliver To Sujan - Bangalore 560019
          </Text>
        </View>
      </View>

      <Text style={{ color: "green", marginHorizontal: 10, fontWeight: "500" }}>
        IN Stock
      </Text>

      {/* Add To Cart Button */}
      <Pressable
        onPress={addItemToCart}
        disabled={isAdding}
        style={{
          backgroundColor: isAdding ? "#ccc" : "#FFC72C",
          padding: 10,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 10,
          marginVertical: 10,
        }}
      >
        <Text>
          {isAdding
            ? "Adding..."
            : addedToCart
            ? "Added to Cart"
            : "Add to Cart"}
        </Text>
      </Pressable>

      {/* Buy Now Button */}
      <Pressable
        style={{
          backgroundColor: "#FFAC1C",
          padding: 10,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 10,
          marginVertical: 10,
        }}
      >
        <Text>Buy Now</Text>
      </Pressable>
    </ScrollView>
      </View>
  );
};

export default ProductInfoScreen;

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

