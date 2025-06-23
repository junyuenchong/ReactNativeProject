import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Custom back button handler for Android.
 * 
 * @param {Object} options
 * @param {boolean} options.confirmExit - Prompt before exiting app on root screen
 * @param {Function} options.onExit - Custom exit handler
 */
export default function useBackButtonHandler({
  confirmExit = true,
  onExit = () => BackHandler.exitApp(),
} = {}) {
  const navigation = useNavigation();

  useEffect(() => {
    const handleBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (confirmExit) {
        Alert.alert('Exit App', 'Are you sure you want to close the application?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: onExit },
        ]);
      } else {
        onExit();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove(); // cleanup
  }, [navigation, confirmExit, onExit]);
}
