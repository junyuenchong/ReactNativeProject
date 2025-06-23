import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

export default function useAddress(userId) {
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  // Fetch all addresses
  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`https://reactnativeproject.onrender.com/addresses/${userId}`);
      const { addresses } = res.data;
      setAddresses(addresses);
      const defaultAddr = addresses.find((addr) => addr.status === "default");
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  }, [userId]);

  // Fetch default address
  const fetchDefaultAddress = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `https://reactnativeproject.onrender.com/addresses/default/${userId}`
      );
      setDefaultAddress(res.data.address || null);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("No default address found.");
      } else {
        console.error("Error fetching default address", err);
      }
      setDefaultAddress(null);
    }
  }, [userId]);

  // Auto-fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchDefaultAddress();
      fetchAddresses();
    }, [userId])
  );

  // Update default address
  const updateDefaultAddress = async (addressId) => {
    try {
      await axios.put(`https://reactnativeproject.onrender.com/addresses/default/${userId}`, {
        addressId,
      });
      fetchAddresses();
      fetchDefaultAddress();
    } catch (err) {
      console.error("Error updating default address", err);
    }
  };

  return {
    defaultAddress,
    addresses,
    selectedAddress,
    setSelectedAddress,
    updateDefaultAddress,
  };
}
