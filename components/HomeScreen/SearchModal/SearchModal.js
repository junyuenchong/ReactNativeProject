// components/HomeScreen/SearchModal/component.js
import React from "react";
import { View, Text, Pressable, Image, FlatList, Keyboard } from "react-native";
import { ScrollView } from "react-native-virtualized-view";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import * as Animatable from "react-native-animatable";
import styles from "../Styles/searchModalStyles";


const SearchModal = ({
  searchModalVisible,
  setSearchModalVisible,
  searchHistory,
  recommended,
  setSearchQuery,
  selectedCategory,
  fetchProducts,
  navigation,
  fetchRecommendedProduct,     
  getSearchHistory,    
}) => {
  const handleRecentSearch = async (term) => {
    setSearchModalVisible(false);
    setSearchQuery(term);
    Keyboard.dismiss();
    await fetchRecommendedProduct();
    await getSearchHistory();
    await fetchProducts({ query: term, category: selectedCategory,reset:true });

  };

  return (
    <BottomModal
      visible={searchModalVisible}
      onTouchOutside={() => setSearchModalVisible(false)}
      onBackdropPress={() => setSearchModalVisible(false)}
      modalAnimation={new SlideAnimation({ slideFrom: "bottom" })}
    >
      <ModalContent className={styles.modalContainer}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <View className="mb-2">
              <Text className={styles.historyText}>🕑 Recent Searches</Text>
              {searchHistory.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleRecentSearch(item.historyname)}
                  className={styles.historyItem}
                >
                  <Text className={styles.historyLabel}>🔍 {item.historyname}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Recommended Products */}
          <View className="w-full mt-3">
            <Text className={styles.sectionTitle}>🎯 Recommended for You</Text>

            <FlatList
              data={recommended}
              horizontal
              keyExtractor={(item) => item._id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 5, paddingRight: 10 }}
              renderItem={({ item, index }) => (
                <Animatable.View
                  animation="fadeInUp"
                  delay={index * 80}
                  duration={500}
                  className={styles.productCard}
                >
                  <Image
                    source={{ uri: `https://reactnativeproject.onrender.com/${item.imageUrls[0]}` }}
                    className={styles.productImage}
                    resizeMode="cover"
                  />
                  <View className="mt-2 items-center">
                    <Text numberOfLines={1} className={styles.productName}>
                      {item.name}
                    </Text>
                    <Text className={styles.productPrice}>RM {item.price}</Text>
                    <Pressable
                      onPress={() => {
                        setSearchModalVisible(false);
                        navigation.navigate("Info", {
                          id: item._id,
                          title: item.name,
                          price: item.price,
                          carouselImages: item.imageUrls.map(
                            (url) => `https://reactnativeproject.onrender.com/${url}`
                          ),
                          color: item.colour,
                          size: item.description,
                          oldPrice: item.oldPrice,
                          item,
                        });
                      }}
                      className={styles.addButton}
                    >
                      <Text className={styles.addButtonText}>Add to Cart</Text>
                    </Pressable>
                  </View>
                </Animatable.View>
              )}
            />
          </View>
        </ScrollView>
      </ModalContent>
    </BottomModal>
  );
};

export default SearchModal;
