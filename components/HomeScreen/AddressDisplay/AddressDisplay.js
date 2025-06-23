import { Pressable, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import addressdisplaystyles from "../Styles/addressstyles";

const AddressDisplay = ({ defaultAddress, onPress }) => {
  return (
    <Pressable onPress={onPress} className={addressdisplaystyles.container}>
      <Ionicons name="location-outline" size={24} color="black" />
      <Pressable>
        {defaultAddress ? (
          <Text>
            Deliver to {defaultAddress?.name} - {defaultAddress?.street}
          </Text>
        ) : (
          <Text className={addressdisplaystyles.placeholderText}>
            Add an Address
          </Text>
        )}
      </Pressable>
      <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
    </Pressable>
  );
};

export default AddressDisplay;
