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
import useProductCard from "../../hooks/useProductCard";
import useProducts from "../../hooks/useProducts";

const HomeScreen = () => {
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const insets = useSafeAreaInsets();
  const [categoryName, setCategoryName] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const showNoProducts = useNoProducts({ refreshing, products });

  useBackButtonHandler({
    confirmExit: true,
    onExit: () => {
      console.log("Exiting app...");
      BackHandler.exitApp();
    },
  });


  const {
    refreshing,
    isLoadingMore,
    fetchProducts,
    loadMoreData,
    refreshList, // ✅ Add this line
  } = useProducts({ userId, products, setProducts });


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

  const uniqueProducts = Array.from(
    new Map(
      (Array.isArray(products) ? products : []).map(item => [item._id, item])
    ).values()
  );



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
        data={uniqueProducts}
        keyExtractor={(item, index) =>
          item && item._id && typeof item._id === 'string'
            ? item._id
            : `fallback-${index}`
        }
        numColumns={2}
        renderItem={renderProductItem}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          loadMoreData({
            query: searchQuery,
            category: categoryName,
          });
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
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
