import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  setCart,
} from "../../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { UserType } from "../../UserContext";
import { useFocusEffect } from "@react-navigation/native";

const CartScreen = () => {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  const { userId } = useContext(UserType);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:8000/addresses/${userId}`
      );
      const { addresses } = response.data || {};
      setAddresses(addresses);

      const defaultAddr = addresses.find((addr) => addr.status === "default");

      if (defaultAddr) {
        setDefaultAddress(defaultAddr);
        dispatch({
          type: "SET_DEFAULT_ADDRESS",
          payload: defaultAddr,
        });
      } else {
        setDefaultAddress(null); // ✅ Clear if none found
        dispatch({
          type: "SET_DEFAULT_ADDRESS",
          payload: null,
        });
      }
    } catch (error) {
      console.log("Error fetching addresses", error);
      setDefaultAddress(null); // ✅ Also clear on error
      dispatch({
        type: "SET_DEFAULT_ADDRESS",
        payload: null,
      });
    }
  };

  // Fetch cart from backend on mount
  const fetchCart = async () => {
    try {
      const response = await axios.post("http://10.0.2.2:8000/user/get-cart", {
        userId,
      });
      if (response.data.cart) {
        dispatch(setCart(response.data.cart));
      }
    } catch (error) {
      console.log("Error fetching cart", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchAddresses();
        fetchCart();
      }
    }, [userId])
  );

  const increaseQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    dispatch(incrementQuantity(item));
    updateCartItem(item, newQuantity);
  };

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      dispatch(decrementQuantity(item));
      updateCartItem(item, newQuantity);
    } else {
      dispatch(removeFromCart(item));
      deleteCartItem(item);
    }
  };

  const deleteItem = (item) => {
    dispatch(removeFromCart(item));
    deleteCartItem(item);
  };

  // Update cart item quantity on backend
  const updateCartItem = async (item, quantity) => {
    try {
      await axios.post("http://10.0.2.2:8000/user/cart", {
        userId,
        product: {
          ...item,
          quantity,
        },
      });
    } catch (error) {
      console.log("Error updating cart item", error);
    }
  };

  // Delete cart item from backend & update redux state with fresh cart
  const deleteCartItem = async (item) => {
    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/user/delete-cart-item",
        {
          userId,
          productId: item.id,
          color: item.color,
          size: item.size,
        }
      );

      if (response.data.cart) {
        dispatch(setCart(response.data.cart)); // sync redux cart with backend
      }
    } catch (error) {
      console.log("Error deleting cart item", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={{
            uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
          }}
        />
      </View>

      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Subtotal section (left side) */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "400" }}>Subtotal:</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>RM {total}</Text>
        </View>

        {/* Default Address block (right side) */}
        {defaultAddress ? (
          <View
            style={{
              alignItems: "flex-end",
              maxWidth: "60%",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Deliver to:
            </Text>
            <Text style={{ fontSize: 14, textAlign: "right" }}>
              {defaultAddress.houseNo}, {defaultAddress.street},{" "}
              {defaultAddress.landmark}
            </Text>
            <Text style={{ fontSize: 14, textAlign: "right" }}>
              Malaysia, Puchong
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "flex-end", paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 14, color: "gray", textAlign: "right" }}>
              No default address selected.
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          marginHorizontal: 10,
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "400", fontWeight: "bold" }}>
          User Name:{" "}
        </Text>
        {defaultAddress ? (
          <Text style={{ fontSize: 18, fontWeight: "400" }}>
            {defaultAddress.name}
          </Text>
        ) : (
          <View style={{ alignItems: "flex-end", paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 14, color: "gray", textAlign: "right" }}>
              No user name selected.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => {
          if (cart.length < 1) {
            alert("Please add at least 1 item to the cart.");
          } else {
            if (defaultAddress) {
              navigation.navigate("Payment");
            } else {
              navigation.navigate("Address"); // Redirect user to Address screen
            }
          }
        }}
        style={{
          backgroundColor: "#FFC72C",
          padding: 10,
          borderRadius: 5,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white" }}>
          {defaultAddress
            ? `Proceed to Buy (${cart.length}) items`
            : "Select Delivery Address"}
        </Text>
      </Pressable>

      <View
        style={{
          height: 1,
          borderColor: "#D0D0D0",
          borderWidth: 1,
          marginTop: 16,
        }}
      />

      <View style={{ marginHorizontal: 10 }}>
        {cart?.map((item, index) => (
          <View
            style={{
              backgroundColor: "white",
              marginVertical: 10,
              borderBottomColor: "#F0F0F0",
              borderWidth: 2,
              borderLeftWidth: 0,
              borderTopWidth: 0,
              borderRightWidth: 0,
            }}
            key={index}
          >
            <Pressable
              style={{
                marginVertical: 10,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <View>
                <Image
                  style={{ width: 140, height: 140, resizeMode: "contain" }}
                  source={{ uri: item?.image }}
                />
              </View>

              <View>
                <Text numberOfLines={3} style={{ width: 150, marginTop: 10 }}>
                  {item.title}
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", marginTop: 6 }}
                >
                  RM {item?.price}
                </Text>
                <Image
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                  source={{
                    uri: "https://assets.stickpng.com/thumbs/5f4924cc68ecc70004ae7065.png",
                  }}
                />
                <Text style={{ color: "green" }}>In Stock</Text>
              </View>
            </Pressable>

            <Pressable
              style={{
                marginTop: 15,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 7,
                }}
              >
                {item?.quantity > 1 ? (
                  <Pressable
                    onPress={() => decreaseQuantity(item)}
                    style={{
                      backgroundColor: "#D8D8D8",
                      padding: 7,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <AntDesign name="minus" size={24} color="black" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => deleteItem(item)}
                    style={{
                      backgroundColor: "#D8D8D8",
                      padding: 7,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <AntDesign name="delete" size={24} color="black" />
                  </Pressable>
                )}

                <Pressable
                  style={{
                    backgroundColor: "white",
                    paddingHorizontal: 18,
                    paddingVertical: 6,
                  }}
                >
                  <Text>{item?.quantity}</Text>
                </Pressable>

                <Pressable
                  onPress={() => increaseQuantity(item)}
                  style={{
                    backgroundColor: "#D8D8D8",
                    padding: 7,
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                  }}
                >
                  <Feather name="plus" size={24} color="black" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => deleteItem(item)}
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>Delete</Text>
              </Pressable>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 15,
              }}
            >
              <Pressable
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>Save For Later</Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>See More Like this</Text>
              </Pressable>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
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
