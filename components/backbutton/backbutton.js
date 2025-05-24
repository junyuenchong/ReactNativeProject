// useBackButtonHandler.js
import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function useBackButtonHandler(
  modalVisible       = false,
  setModalVisible    = () => {},
  searchModalVisible = false,
  setSearchModalVisible = () => {},
) {
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      if (searchModalVisible) {
        setSearchModalVisible(false);
        return true;
      }
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      Alert.alert('Exit App', 'Are you sure you want to close the application?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES', onPress: BackHandler.exitApp },
      ]);
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation, modalVisible, searchModalVisible]);
}
