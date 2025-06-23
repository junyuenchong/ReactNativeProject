import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../../UserContext";
import useBackButtonHandler from "../../hooks/backbutton";
import useSearchBar from "../../hooks/useSearchBar";
import useAddress from "../../hooks/useAddress";
import useNoProducts from "../../hooks/useNoProducts";
import useFetchUser from "../../hooks/useFetchUser";
import Categories from "../../components/HomeScreen/category/Categories";
import TodayDealProduct from "../../components/HomeScreen/Deals/TodayDealProduct";
import Slider from "../../components/HomeScreen/Slider/slider";
import SearchBar from "../../components/HomeScreen/SearchBar/SearchBar";
import SearchModal from "../../components/HomeScreen/SearchModal/SearchModal";
import AddressDisplay from "../../components/HomeScreen/AddressDisplay/AddressDisplay";
import AddressModal from "../../components/HomeScreen/AddressModal/AddressModal";
import NoProductsMessage from "../../components/HomeScreen/NoProductsMessage/NoProductsMessage";
import ProductCard from "../../components/HomeScreen/ProductCard/ProductsCard.";


const HomeScreen = () => {
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const insets = useSafeAreaInsets();
  const [categoryName, setCategoryName] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const showNoProducts = useNoProducts({ refreshing, products });

  useBackButtonHandler({
    confirmExit: true,
    onExit: () => {
      console.log("Exiting app...");
      BackHandler.exitApp();
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 5;
  const lastLoadTime = useRef(0); // store timestamp of last load
  const hasCalledEnd = useRef(false);

  const fetchProducts = async ({
    query = "",
    category = "",
    reset = false,
    skip: customSkip = 0,
  }) => {
    try {
      if (reset) setRefreshing(true);

      const res = await axios.get(
        "https://reactnativeproject.onrender.com/fetchproducts",
        {
          params: {
            query: query.trim() || undefined,
            category: category || undefined,
            userId,
            skip: customSkip,
            limit,
          },
        }
      );

      const fetchedProducts = Array.isArray(res?.data?.data) ? res.data.data : [];
      console.log("✅ Products fetched:", fetchedProducts.length);

      if (reset) {
        setProducts(fetchedProducts);
        setSkip(fetchedProducts.length);
      } else {
        setProducts((prev) => [...prev, ...fetchedProducts]);
        setSkip((prev) => prev + fetchedProducts.length);
      }

      const moreAvailable = fetchedProducts.length > 0 && fetchedProducts.length === limit;
      setHasMore(moreAvailable);
      hasCalledEnd.current = !moreAvailable; // ✅ Block further loads if no more
    } catch (err) {
      console.error("Fetch error:", err?.response?.data || err.message);
    } finally {
      if (reset) setRefreshing(false);

  // Delay hiding spinner slightly to allow UI to catch up
  setTimeout(() => {
    setIsLoadingMore(false);
  }, 3000);
    }
  };

  const loadMoreData = () => {
    console.log("📦 loadMoreData triggered — hasMore:", hasMore, "isLoadingMore:", isLoadingMore, "hasCalledEnd:", hasCalledEnd.current);
  
    const now = Date.now();
  
    if (!hasMore || isLoadingMore || hasCalledEnd.current) {
      console.log("⚠️ Skipping loadMoreData...");
      return;
    }
  
    if (now - lastLoadTime.current < 3000) {
      console.log("⏳ Wait before loading more.");
      return;
    }
  
    lastLoadTime.current = now;
    setIsLoadingMore(true);
  
    fetchProducts({
      query: searchQuery,
      category: categoryName,
      skip,
    });
  };

  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    searchHistory,
    recommended,
    searchModalVisible,
    setSearchModalVisible,
    fetchRecommendedProduct,
    getSearchHistory,
    onRefresh,
  } = useSearchBar({ userId, categoryName, fetchProducts });

  const {
    defaultAddress,
    addresses,
    selectedAddress,
    setSelectedAddress,
    updateDefaultAddress,
  } = useAddress(userId);

  useFetchUser(setUserId);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("Login");
  };

  const renderProductItem = ({ item }) => <ProductCard item={item} />;



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
      <FlatList
        ref={flatListRef}
        data={products}
        numColumns={2}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id.toString()}
        onEndReachedThreshold={0.5}
        onEndReached={loadMoreData}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setSkip(0);
              hasCalledEnd.current = false; // ✅ Reset
              fetchProducts({ query: "", category: "", reset: true });
            }}
          />
        }
        ListFooterComponent={() =>
          isLoadingMore ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color="blue" />
            </View>
          ) : null
        }

        ListHeaderComponent={
          <>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              searchHistory={searchHistory}
              setSearchModalVisible={setSearchModalVisible}
              handleLogout={handleLogout}
            />
            <SearchModal
              searchModalVisible={searchModalVisible}
              setSearchModalVisible={setSearchModalVisible}
              searchHistory={searchHistory}
              recommended={recommended}
              setSearchQuery={setSearchQuery}
              selectedCategory={categoryName}
              fetchProducts={fetchProducts}
              navigation={navigation}
              fetchRecommendedProduct={fetchRecommendedProduct}
              getSearchHistory={getSearchHistory}
            />
            <AddressDisplay
              defaultAddress={defaultAddress}
              onPress={() => setAddressModalVisible(true)}
            />
            <Categories
              userId={userId}
              onSelectCategory={(categoryName) => {
                setSearchQuery("");
                setCategoryName(categoryName);
                fetchProducts({ query: "", category: categoryName, reset: true });
              }}
            />
            <Slider />
            <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
              Today's Deals
            </Text>
            <TodayDealProduct />
          </>
        }
        ListEmptyComponent={() => (showNoProducts ? <NoProductsMessage /> : null)}
      />

      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        updateDefaultAddress={updateDefaultAddress}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
