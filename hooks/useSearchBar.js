// hooks/useSearchBar.js
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function useSearchBar({ userId, selectedCategory, fetchProducts}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      Alert.alert("Search", "Please enter a search keyword.");
      return;
    }
  
    await fetchProducts?.({
      query: searchQuery,
      category: selectedCategory,
      reset: true,
    });
  
    await fetchRecommendedProduct();
    await getSearchHistory();
  };
  
  

//fetchSearchProducinSearchMoodal
const getSearchHistory = async () => {
  if (!userId) return;
  try {
    const response = await axios.get(
      `https://reactnativeproject.onrender.com/profile/${userId}`
    );
    const history = response.data.user?.searchhistory || [];

    if (history.length === 0) {
      setSearchHistory([]);
    } else {
      setSearchHistory(history.reverse().slice(0, 5));
    }
  } catch (error) {
    console.error("History fetch failed", error);
  }
};


const fetchRecommendedProduct = async () => {
  if (!userId) return;
  try {
    const res = await axios.get(
      `https://reactnativeproject.onrender.com/fetch-recommeneded-products/${userId}`
    );
    setRecommended(res.data);
  } catch (err) {
    console.error("Error loading recommended products", err);
  }
};


  
  // ⏱️ Pull-to-refresh logic (exported to HomeScreen)
  const onRefresh = useCallback(async () => {
    setSkip(0);
    hasCalledEnd.current = false;         
    await fetchProducts({
      query: searchQuery,
      category: selectedCategory,
      reset: true,            
      skip: 0,                      
    });
  }, [searchQuery, selectedCategory]);
  

// 🔄 Refresh on screen focus or user change
useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      await onRefresh();                // Refresh product list
      await getSearchHistory();         // Load recent searches
      await fetchRecommendedProduct();  // Load recommendations
    };

    loadData();
  }, [userId])
);

  return {
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
 
  };
}
