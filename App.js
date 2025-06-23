import { StyleSheet, StatusBar, View } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import React from "react";
import { Provider } from "react-redux";
import store from "./store";
import { ModalPortal } from "react-native-modals";
import { UserContext } from "./UserContext";
import { BackHandler } from 'react-native';
import "./global.css"
const backgroundColor = '#FEBE10';          

export default function App() {
  
  if (!BackHandler.removeEventListener) {
    BackHandler.removeEventListener = (_evt, sub) => sub?.remove?.();
    }
  return (
    <>
    <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" /> 
     {/* extra 10 px extension under the system bar */}
      <Provider store={store}>
        <UserContext>
          <StackNavigator />
          <ModalPortal />
        </UserContext>
        
      </Provider>
    </>
  );
}


