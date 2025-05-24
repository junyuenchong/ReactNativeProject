import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("http://10.0.2.2:8000/categories");
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = (categoryName) => {
    navigation.setParams({
      selectedCategory: categoryName, // Sets the selected category for filtering or display
      categoryKey: Date.now(), // Generates a unique key to trigger a re-render or refresh the component
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {/* All Products Button */}
        <CategoryItem
          name="All"
          icon="appstore1"
          onPress={() => handleCategoryPress(null)}
          iconColor="#007AFF"
          backgroundColor="#E8F4FD"
        />

        {/* Render Categories */}
        {categories.map(({ _id, name, icon }) => (
          <CategoryItem
            key={_id}
            name={name}
            icon={icon}
            onPress={() => handleCategoryPress(name)}
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
  iconColor = "#4CAF50",
  backgroundColor = "#FFFFFF",
}) => (
  <View style={styles.categoryItem}>
    <TouchableOpacity
      style={[styles.catContainer, { backgroundColor }]}
      onPress={onPress}
    >
      {icon && (
        <AntDesign name={icon} style={[styles.catIcon, { color: iconColor }]} />
      )}
      <Text style={styles.catTitle}>{name}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryItem: {
    marginRight: 15,
  },
  catContainer: {
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  catIcon: {
    fontSize: 30,
  },
  catTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
});

export default Categories;
