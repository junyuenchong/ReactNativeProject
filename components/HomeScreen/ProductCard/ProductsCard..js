import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import * as Animatable from "react-native-animatable";
import useProductCard from "../../../hooks/useProductCard";
import { productCardStyles } from "../Styles/productCardStyles";

const ProductCard = ({ item }) => {
  const { handleNavigate, imageUrl } = useProductCard(item);

  return (
    <Animatable.View
  animation="fadeInDown"
  duration={1000}
  className={productCardStyles.card}
>
  <View className={productCardStyles.imageWrapper}>
  <Image
    source={{ uri: imageUrl }}
    className={productCardStyles.image}
    resizeMode="contain"
  />
</View>
  <View className={productCardStyles.infoContainer}>
    <Text numberOfLines={1} className={productCardStyles.name}>
      {item.name}
    </Text>
    <Text className={productCardStyles.price}>RM {item.price}</Text>
  </View>
  <Pressable
    onPress={handleNavigate}
    className={productCardStyles.button}
  >
    <Text className={productCardStyles.buttonText}>Add to Cart</Text>
  </Pressable>
</Animatable.View>

  );
};

export default ProductCard;
