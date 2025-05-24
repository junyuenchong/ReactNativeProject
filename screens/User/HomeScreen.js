// UserHomePage
import {
  StyleSheet,
  TextInput,
  View,
  Platform,
  Pressable,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Keyboard,
  ToastAndroid,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native-virtualized-view";
import React, { useEffect, useCallback, useState, useContext } from "react";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import Categories from "../../components/category/Categories";
import TodayDealProduct from "../../components/Deals/TodayDealProduct";
import Slider from "../../components/Slider/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as Animatable from "react-native-animatable";
import useBackButtonHandler from "../../components/backbutton/backbutton";
import { UserType } from "../../UserContext";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const HomeScreen = () => {
  /* --------------------------------------------------------------------- */
  /* Navigation & context                                                  */
  /* --------------------------------------------------------------------- */
  const navigation = useNavigation();
  // Access the current navigation route object (so we can read params sent from other screens)
  const route = useRoute();
  const { userId, setUserId } = useContext(UserType); // Get userId, setUserId from context

  /* --------------------------------------------------------------------- */
  /* State                                                                 */
  /* --------------------------------------------------------------------- */
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAdress] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [noProductsFound, setNoProductsFound] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  //modal visible
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const flatListRef = React.useRef(null); // Product list ref for scroll
  const selectedCategory = route.params?.selectedCategory; // Selected category from params
  const categoryKey = route.params?.categoryKey; // Category key forces list refresh
  const insets = useSafeAreaInsets(); //Get screen edge safe insets.

  /* --------------------------------------------------------------------- */
  /* Handle Android back button                                            */
  /* --------------------------------------------------------------------- */
  useBackButtonHandler();

  /* --------------------------------------------------------------------- */
  /* Search and Selected Category                                          */
  /* --------------------------------------------------------------------- */
  // Clear search and fetch products when category changes
  useEffect(() => {
    if (typeof selectedCategory !== "undefined") {
      setSearchQuery("");
      setTimeout(() => {
        fetchProducts({ query: "", category: selectedCategory ?? "" });
      }, 50);
    }
  }, [selectedCategory, categoryKey]);

  // Refresh product list when the category changes from route params
  useEffect(() => {
    onRefresh();
  }, [route.params?.selectedCategory]);

  // Fetch products with optional query and category filter
  const fetchProducts = async ({ query = "", category = "" }) => {
    try {
      setRefreshing(true); // Show loading spinner
      setNoProductsFound(false); // Reset "no products found" state

      // API call to fetch products
      const { data: products = [] } = await axios.get(
        "http://10.0.2.2:8000/fetchproducts",
        {
          params: {
            query: query.trim() || undefined,
            category: category || undefined,
            userId,
          },
        }
      );

      const hasResults = products.length > 0;
      setNoProductsFound(!hasResults); // Show message if no products
      setProducts(hasResults ? products.sort(() => Math.random() - 0.5) : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setRefreshing(false); // Hide loading spinner
    }
  };

  // Refresh product list using current search or search history history and selected category
  const onRefresh = useCallback(async () => {
    await fetchProducts({
      query: searchQuery,
      category: selectedCategory ?? "",
    });
  }, [searchQuery, selectedCategory]);

  // Handle product search by keyword
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      Alert.alert("Search", "Please enter a search keyword.");
      return;
    }
    fetchProducts({ query: searchQuery, category: selectedCategory ?? "" });// add search history to backend
    fetchRecommendedProduct();
    getSearchHistory();
  };

  // Fetch user's recent search history
  const getSearchHistory = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `http://10.0.2.2:8000/profile/${userId}`
      );
      const history = response.data.user?.searchhistory || [];

      if (history.length === 0) {
        setSearchModalVisible(false); // Close modal if no history
      } else {
        setSearchHistory(history.reverse().slice(0, 5)); // Show last 5
      }
    } catch (error) {
      console.error("History fetch failed", error);
      setSearchModalVisible(false); // Optional: close modal on error
    }
  };

  // Fetch recommended products based on user history
  const fetchRecommendedProduct = async () => {
    try {
      const res = await axios.get(
        `http://10.0.2.2:8000/fetch-recommeneded-products/${userId}`
      );
      setRecommended(res.data);
    } catch (err) {
      console.error("Error loading recommended products", err);
    }
  };

  // Load search history when modal opens
  useEffect(() => {
    if (userId) getSearchHistory();
  }, [userId, searchModalVisible]);

  /* --------------------------------------------------------------------- */
  /* Address                                                               */
  /* --------------------------------------------------------------------- */
  // Load addresses when address modal opens
  // useEffect(() => {
  //   if (userId) fetchAddresses();
  // }, [userId, addressModalVisible]);

  // Fetch default address when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchDefaultAddress();
      if (userId) fetchAddresses();
    }, [userId])
  );

  // Get default address from backend
  const fetchDefaultAddress = async () => {
    try {
      const res = await axios.get(
        `http://10.0.2.2:8000/addresses/default/${userId}`
      );
      setDefaultAddress(res.data.address || null);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("No default address found for user.");
      } else {
        console.error("Failed to fetch default address", err);
      }
      setDefaultAddress(null);
    }
  };

  // Fetch all addresses for current user
  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:8000/addresses/${userId}`);
      const { addresses } = res.data;
      setAddresses(addresses);

      const defaultAddr = addresses.find((addr) => addr.status === "default");
      if (defaultAddr) setSelectedAdress(defaultAddr);
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  };

  // Update user's default address
  const updateDefaultAddress = async (addressId) => {
    try {
      await axios.put(`http://10.0.2.2:8000/addresses/default/${userId}`, {
        addressId,
      });
      fetchAddresses();
      fetchDefaultAddress();
    } catch (err) {
      console.error("Error updating default address", err);
    }
  };

  /* --------------------------------------------------------------------- */
  /* Set UserId                                                            */
  /* --------------------------------------------------------------------- */
  // Decode token to get user ID on app start
  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    };
    fetchUser();
    console.log(userId);
  }, [userId]);

  /* --------------------------------------------------------------------- */
  /* Log Out User Account                                                  */
  /* --------------------------------------------------------------------- */
  // Log user out
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("Login");
  };
  /* --------------------------------------------------------------------- */
  /* Render each product item using FlatList for efficient product display. */
  /* --------------------------------------------------------------------- */
  // Display a product item in the product list
  const renderProductItem = ({ item }) =>
    noProductsFound ? (
      <Text
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 16,
          color: "gray",
        }}
      >
        No products found.
      </Text>
    ) : (
      <Animatable.View
        key={item._id}
        style={styles.productCard}
        animation="fadeInDown"
        duration={1000}
      >
        <Image
          source={{ uri: `http://10.0.2.2:8000/${item.imageUrls[0]}` }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text numberOfLines={1} style={styles.productName}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>RM {item.price}</Text>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate("Info", {
              id: item._id,
              title: item.name,
              price: item?.price,
              carouselImages: item.imageUrls.map(
                (url) => `http://10.0.2.2:8000/${url}`
              ),
              color: item.colour,
              size: item.description,
              oldPrice: item?.price,
              item,
            })
          }
          style={styles.addToCartButton}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
      </Animatable.View>
    );

  // Placeholder for pagination or infinite scroll
  const loadMoreData = () => {
    console.log("Load more data...");
  };

  // Scroll to top when product list changes
  useEffect(() => {
    if (flatListRef.current && products.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [products]);

  /* ======================= JSX RETURN ============================ */
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: "white",
      }}
    >
      {/* Displays product list with search, refresh, recommendations, and address options.*/}
      <FlatList
        ref={flatListRef}
        data={products}
        numColumns={2}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id.toString()}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View
              style={{
                backgroundColor: "#FEBE10",
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 7,
                  gap: 10,
                  backgroundColor: "white",
                  borderRadius: 3,
                  height: 38,
                  flex: 1,
                }}
              >
                <TextInput
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  onPressIn={() => {
                    if (searchHistory.length >= 1 && !searchModalVisible) {
                      setSearchModalVisible(true);
                    } else {
                      ToastAndroid.show(
                        "Please search at least one product",
                        ToastAndroid.SHORT
                      );
                    }
                  }}
                  style={{ flex: 1, paddingLeft: 10 }}
                />
                <Pressable onPress={handleSearch} style={{ paddingRight: 10 }}>
                  <AntDesign name="search1" size={22} color="black" />
                </Pressable>
              </Pressable>
              <Pressable onPress={handleLogout} style={{ paddingLeft: 10 }}>
                <MaterialIcons name="logout" size={24} color="black" />
              </Pressable>
            </View>

            {/* Search Modal */}
            <BottomModal
              visible={searchModalVisible}
              onTouchOutside={() => setSearchModalVisible(false)}
              onBackdropPress={() => setSearchModalVisible(false)}
              modalAnimation={new SlideAnimation({ slideFrom: "bottom" })}
            >
              <ModalContent
                style={{
                  width: "100%",
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                  maxHeight: 500,
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <View style={{ marginBottom: 10 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 10,
                        }}
                      >
                        🕑 Recent Searches
                      </Text>
                      {searchHistory.map((item, index) => (
                        <Pressable
                          key={index}
                          onPress={() => {
                            const term = item.historyname;
                            setSearchModalVisible(false);
                            setSearchQuery(term);
                            Keyboard.dismiss();
                            fetchProducts({
                              query: term,
                              category: selectedCategory ?? "",
                            });
                          }}
                          style={({ pressed }) => ({
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            backgroundColor: pressed ? "#f0f0f0" : "#f7f7f7",
                            borderRadius: 8,
                            marginBottom: 8,
                          })}
                        >
                          <Text style={{ fontSize: 16, color: "#444" }}>
                            🔍 {item.historyname}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  {/* Recommended Products (unchanged) */}
                  {/* 🎯 Recommended Products */}
                  {recommended.length > 0 && (
                    <View style={{ width: "100%", marginTop: 10 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 12,
                        }}
                      >
                        🎯 Recommended for You
                      </Text>

                      <FlatList
                        data={recommended}
                        horizontal={true}
                        keyExtractor={(item) => item._id.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          paddingLeft: 5,
                          paddingRight: 10,
                        }}
                        renderItem={({ item, index }) => (
                          <Animatable.View
                            animation="fadeInUp"
                            delay={index * 80}
                            duration={500}
                            style={{
                              width: 150,
                              backgroundColor: "#fff",
                              borderRadius: 12,
                              marginRight: 16,
                              padding: 10,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.1,
                              shadowRadius: 3,
                              elevation: 2,
                            }}
                          >
                            <Image
                              source={{
                                uri: `http://10.0.2.2:8000/${item.imageUrls[0]}`,
                              }}
                              style={{
                                width: "80%",
                                height: 100,
                                resizeMode: "cover",
                                borderRadius: 8,
                                marginLeft: 12,
                              }}
                            />
                            <View style={{ marginTop: 8 }}>
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: "#333",
                                  marginBottom: 4,
                                  textAlign: "center",
                                }}
                              >
                                {item.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "bold",
                                  color: "#2e8b57",
                                  textAlign: "center",
                                }}
                              >
                                RM {item.price}
                              </Text>
                              <Pressable
                                onPress={() => {
                                  // Close the search modal
                                  setSearchModalVisible(false);

                                  // Navigate to the Info screen with product details
                                  navigation.navigate("Info", {
                                    id: item._id,
                                    title: item.name,
                                    price: item?.price,
                                    carouselImages: item.imageUrls.map(
                                      (imgPath) =>
                                        `http://10.0.2.2:8000/${imgPath}`
                                    ),
                                    color: item.colour,
                                    size: item.description,
                                    oldPrice: item?.price,
                                    item, // shorthand for item: item
                                  });
                                }}
                                style={{
                                  marginTop: 8,
                                  backgroundColor: "#ffc72c",
                                  paddingVertical: 6,
                                  borderRadius: 20,
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    color: "#fff",
                                  }}
                                >
                                  Add to Cart
                                </Text>
                              </Pressable>
                            </View>
                          </Animatable.View>
                        )}
                      />
                    </View>
                  )}
                </ScrollView>
              </ModalContent>
            </BottomModal>

            {/*Fetch Default Address*/}
            <Pressable
              onPress={() => setAddressModalVisible(!addressModalVisible)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                padding: 5,
                backgroundColor: "white",
              }}
            >
              <Ionicons name="location-outline" size={24} color="black" />
              <Pressable>
                {defaultAddress ? (
                  <Text>
                    Deliver to {defaultAddress?.name} - {defaultAddress?.street}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: "500" }}>
                    Add a Address
                  </Text>
                )}
              </Pressable>

              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </Pressable>

            {/* Rest of header components ... (Categories, Slider, etc.) */}
            <Categories />
            <Slider />

            {/* Today's Deals */}
            <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
              Today's Deals
            </Text>
            <TodayDealProduct />
          </>
        }
        // No products found.
        ListEmptyComponent={
          !refreshing && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 50,
              }}
            >
              <Text style={{ fontSize: 16, color: "gray" }}>
                No products found.
              </Text>
            </View>
          )
        }
      />
      {/* Address Modal unchanged for brevity */}
      <BottomModal
        onBackdropPress={() => setAddressModalVisible(!addressModalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        onHardwareBackPress={() => setAddressModalVisible(!addressModalVisible)}
        visible={addressModalVisible}
        onTouchOutside={() => setAddressModalVisible(!addressModalVisible)}
      >
        <ModalContent style={{ width: "100%", height: 400 }}>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              Choose your Location
            </Text>
            <Text style={{ marginTop: 5, fontSize: 16, color: "gray" }}>
              Select a delivery location to see product availability and
              delivery options
            </Text>
          </View>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => {
                  setAddressModalVisible(false);
                  navigation.navigate("Address");
                }}
                style={{
                  width: 140,
                  height: 140,
                  borderColor: "#D0D0D0",
                  marginTop: 10,
                  borderWidth: 1,
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#0066b2",
                    fontWeight: "500",
                  }}
                >
                  Add an Address or pick-up point
                </Text>
              </Pressable>
              <View style={{ marginRight: 10 }} />
              {addresses?.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedAdress(item);
                    updateDefaultAddress(item._id);
                  }}
                  style={{
                    width: 140,
                    height: 140,
                    borderColor: "#D0D0D0",
                    borderWidth: 1,
                    padding: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 3,
                    marginRight: 15,
                    marginTop: 10,
                    backgroundColor:
                      selectedAddress === item ? "#FBCEB1" : "white",
                  }}
                >
                  {item?.status === "default" && (
                    <Text
                      style={{
                        fontSize: 15,
                        color: "green",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Default
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                      {item?.name}
                    </Text>
                    <Entypo name="location-pin" size={24} color="red" />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{ width: 130, fontSize: 13, textAlign: "center" }}
                  >
                    {item?.houseNo}, {item?.landmark}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{ width: 130, fontSize: 13, textAlign: "center" }}
                  >
                    {item?.street}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{ width: 130, fontSize: 13, textAlign: "center" }}
                  >
                    Malaysia, Puchong
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: "column", gap: 7, marginBottom: 30 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Entypo name="location-pin" size={22} color="#0066b2" />
              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Enter an Malaysia pincode
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="locate-sharp" size={22} color="#0066b2" />
              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Use My Current location
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <AntDesign name="earth" size={22} color="#0066b2" />
              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Deliver outside Malaysia
              </Text>
            </View>
          </View>
        </ModalContent>
      </BottomModal>
    </SafeAreaView>
  );
};

/* ======================= STYLES ============================ */
const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    margin: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    borderRadius: 10,
  },
  productInfo: { marginTop: 10, alignItems: "center" },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  productPrice: {
    color: "green",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  addToCartButton: {
    backgroundColor: "#FFC72C",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  addToCartText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default HomeScreen;
