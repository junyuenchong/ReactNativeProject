import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import useCategories from "../../../hooks/useCategories";
import categoryStyles from "../Styles/categoryStyles";

const Categories = ({ userId, onSelectCategory }) => {
  const categories = useCategories(userId);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className={categoryStyles.container}>
        <CategoryItem
          name="All"
          icon="appstore1"
          onPress={() => onSelectCategory(null)}
          bg={categoryStyles.selectedBg}
          color="#007AFF"
        />
        {categories.map(({ _id, name, icon }) => (
          <CategoryItem
            key={_id}
            name={name}
            icon={icon}
            onPress={() => onSelectCategory(name)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const CategoryItem = ({
  name,
  icon,
  onPress,
  color = "#4CAF50",
  bg = categoryStyles.defaultBg,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`${categoryStyles.itemWrapper} ${bg}`}
  >
    {icon && <AntDesign name={icon} size={30} color={color} />}
    <Text className={categoryStyles.nameText}>{name}</Text>
  </TouchableOpacity>
);

export default Categories;
