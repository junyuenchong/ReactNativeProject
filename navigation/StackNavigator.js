import { StyleSheet } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// User Screens
import LoginScreen from "../screens/User/LoginScreen";
import RegisterScreen from "../screens/User/RegisterScreen";
import HomeScreen from "../screens/User/HomeScreen";
import ProfileScreen from "../screens/User/ProfileScreen";
import CartScreen from "../screens/User/CartScreen";
import ProductInfoScreen from "../screens/User/ProductInfoScreen";
import AddAdressScreen from "../screens/User/AddAdressScreen";
import AdressScreen from "../screens/User/AdressScreen";
import ResetPasswordScreen from "../screens/User/ResetPasswordScreen";
import PaymentScreen from "../screens/User/PaymentScreen";
import PayPalWebView from "../screens/User/PayPalWebView";
import OrderHistoryScreen from "../screens/User/OrderHistoryScreen";
import OrderSuccess from "../screens/User/OrderSuccess ";
import EditAddressScreen from "../screens/User/EditAddressScreen ";

// Admin
import FetchProduct from "../screens/Admin/FetchProduct";
import AdminPage from "../screens/Admin/AdminPage";
import ProductDetails from "../screens/Admin/ProductDetails";

//Icons
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";



const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Entypo name="home" size={24} color="#008E97" />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color="#008E97" />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarLabel: "Cart",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="shoppingcart" size={24} color="#008E97" />
              ) : (
                <AntDesign name="shoppingcart" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Search">
        {/* Stack Screen Function */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Info"
          component={ProductInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddAddress"
          component={AddAdressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Address"
          component={AdressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAddress"
          component={EditAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
     
        <Stack.Screen
          name="ForgotPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PayPalWebView"
          component={PayPalWebView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccess}
          options={{ headerShown: false }}
        />
  
        <Stack.Screen
          name="FetchProduct"
          component={FetchProduct}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetails}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
