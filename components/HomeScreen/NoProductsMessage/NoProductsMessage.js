import { View, Text } from "react-native";
import styles from "../Styles/noProductsStyles";

const NoProductsMessage = () => {
  return (
    <View className={styles.container}>
      <Text className={styles.text}>No products found.</Text>
    </View>
  );
};

export default NoProductsMessage;
