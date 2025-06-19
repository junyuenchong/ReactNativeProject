import React, { useEffect, useState, useContext } from "react";
import {
  Pressable,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import { UserType } from "../../UserContext";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
const OrderHistoryScreen = () => {
  //navigation
  const navigation = useNavigation();
  const { userId } = useContext(UserType);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inside OrderHistoryScreen component
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://10.0.2.2:8000/orders/${userId}`
        );
        setOrders(
          Array.isArray(response.data) ? response.data : response.data.orders
        );
        console.log("Fetched orders:", response.data);
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>
        🧾 Order ID: <Text style={styles.bold}>{item._id}</Text>
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>RM {item.totalPrice?.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text
          style={[
            styles.paymentTag,
            item.paymentMethod === "PayPal" ? styles.paypal : styles.cod,
          ]}
        >
          {item.paymentMethod}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      <Text style={[styles.label, { marginTop: 8 }]}>Items:</Text>
      {Array.isArray(item.products) &&
        item.products.map((prod, index) => (
          <Text key={index} style={styles.itemText}>
            • {prod.name} x{prod.quantity}
          </Text>
        ))}

      <Text style={[styles.label, { marginTop: 8 }]}>Shipping Address:</Text>
      <Text style={styles.itemText}>👤 Name: {item.shippingAddress?.name}</Text>
      <Text style={styles.itemText}>
        📞 Mobile: {item.shippingAddress?.mobileNumber}
      </Text>
      <Text style={styles.itemText}>
        🏠 House No: {item.shippingAddress?.houseNo}
      </Text>
      <Text style={styles.itemText}>
        🛣️ Street: {item.shippingAddress?.street}
      </Text>
      <Text style={styles.itemText}>
        📍 Landmark: {item.shippingAddress?.landmark}
      </Text>
      <Text style={styles.itemText}>
        📮 Postal Code: {item.shippingAddress?.postalCode}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No orders found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* App Header - Only rendered once */}
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

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

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
    width: 140,
    height: 80,
    resizeMode: "contain",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#222",
  },
  itemText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
    marginTop: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  paymentTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 12,
    overflow: "hidden",
    textAlign: "center",
    color: "#fff",
  },
  paypal: {
    backgroundColor: "#003087",
  },
  cod: {
    backgroundColor: "#2e7d32",
  },
});

export default OrderHistoryScreen;
