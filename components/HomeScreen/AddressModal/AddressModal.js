import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import { Entypo, Ionicons, AntDesign } from "@expo/vector-icons";
import styles from "../Styles/addressModalStyles"; // Import Tailwind class constants

const AddressModal = ({
  visible,
  onClose,
  addresses,
  selectedAddress,
  setSelectedAddress,
  updateDefaultAddress,
  navigation,
}) => {
  return (
    <BottomModal
      visible={visible}
      swipeDirection={["up", "down"]}
      swipeThreshold={200}
      modalAnimation={new SlideAnimation({ slideFrom: "bottom" })}
      onTouchOutside={onClose}
      onBackdropPress={onClose}
      onHardwareBackPress={onClose}
    >
      <ModalContent className={styles.modalContainer}>
        {/* Header */}
        <View className="mb-2">
          <Text className={styles.headerTitle}>Choose your Location</Text>
          <Text className={styles.headerSubtitle}>
            Select a delivery location to see product availability and delivery options
          </Text>
        </View>

        {/* Address Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          <View className="flex-row items-center">
            {/* Add Address */}
            <Pressable
              onPress={() => {
                onClose();
                navigation.navigate("Address");
              }}
              className={styles.addAddressBox}
            >
              <Text className={styles.addAddressText}>
                Add an Address or pick-up point
              </Text>
            </Pressable>

            <View className="mr-2" />

            {/* Existing Addresses */}
            {addresses?.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectedAddress(item);
                  updateDefaultAddress(item._id);
                }}
                className={`${styles.addressCardBase} ${
                  selectedAddress === item
                    ? styles.addressCardSelected
                    : styles.addressCardUnselected
                }`}
              >
                {item?.status === "default" && (
                  <Text className={styles.defaultText}>Default</Text>
                )}

                <View className={styles.nameRow}>
                  <Text className={styles.nameText}>{item?.name}</Text>
                  <Entypo name="location-pin" size={20} color="red" />
                </View>

                <Text numberOfLines={1} className={styles.addressLine}>
                  {item?.houseNo}, {item?.landmark}
                </Text>

                <Text numberOfLines={1} className={styles.addressLine}>
                  {item?.street}
                </Text>

                <Text numberOfLines={1} className={styles.addressLine}>
                  Malaysia, Puchong
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Location Options */}
        <View className={styles.locationOptionsWrapper}>
          <View className={styles.locationRow}>
            <Entypo name="location-pin" size={22} color="#0066b2" />
            <Text className={styles.locationText}>Enter a Malaysia pincode</Text>
          </View>

          <View className={styles.locationRow}>
            <Ionicons name="locate-sharp" size={22} color="#0066b2" />
            <Text className={styles.locationText}>Use My Current location</Text>
          </View>

          <View className={styles.locationRow}>
            <AntDesign name="earth" size={22} color="#0066b2" />
            <Text className={styles.locationText}>Deliver outside Malaysia</Text>
          </View>
        </View>
      </ModalContent>
    </BottomModal>
  );
};

export default AddressModal;
