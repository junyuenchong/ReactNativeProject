// hooks/useProductCard.js
import { useNavigation } from "@react-navigation/native";

export default function useProductCard(item) {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("Info", {
      id: item._id,
      title: item.name,
      price: item?.price,
      carouselImages: item.imageUrls.map(
        (url) => `https://reactnativeproject.onrender.com/${url}`
      ),
      color: item.colour,
      size: item.description,
      offer: item.offer,
      oldPrice: item.oldPrice,
      item,
    });
  };

  const imageUrl = `https://reactnativeproject.onrender.com/${item.imageUrls[0]}`;

  return { handleNavigate, imageUrl };
}
