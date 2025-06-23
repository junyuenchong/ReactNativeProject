import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategories(userId) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`https://reactnativeproject.onrender.com/categories?userId=${userId}`);
        setCategories(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [userId]);

  return categories;
}
