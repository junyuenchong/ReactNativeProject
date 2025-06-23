import React from "react";
import { View, TextInput, Pressable, ToastAndroid } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import styles from "../Styles/searchBarStyles"; // Import Tailwind class names

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchHistory,
  setSearchModalVisible,
  handleLogout,
  recommended,
  getSearchHistory,
  fetchRecommendedProduct

}) => {
  return (
    <View className={styles.container}>
      <Pressable className={styles.inputContainer}>
        <TextInput
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          onPressIn={async () => {
            if (searchHistory.length > 0 && recommended.length > 0) {
              setSearchModalVisible(true);
            } else {
              ToastAndroid.show("Please search at least one product", ToastAndroid.SHORT);
            }
          }}
          className={styles.textInput}
        />
        <Pressable onPress={handleSearch} className={styles.searchIcon}>
          <AntDesign name="search1" size={22} color="black" />
        </Pressable>
      </Pressable>
      <Pressable onPress={handleLogout} className={styles.logoutIcon}>
        <MaterialIcons name="logout" size={24} color="black" />
      </Pressable>
    </View>
  );
};

export default SearchBar;
