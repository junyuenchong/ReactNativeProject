// hooks/useProductCard.js
import { useNavigation } from "@react-navigation/native";

export default function useProductCard(item) {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("Info", {
      id: item._id,
      title: item.name,
      price: item?.price,
      carouselImages: item.imageUrls.map((url) =>
        url.startsWith("http") ? url : `https://reactnativeproject.onrender.com/${url}`
      ),
      color: item.colour,
      size: item.description,
      offer: item.offer,
      oldPrice: item.oldPrice,
      item,
    });
  };

  const imageUrl = item?.imageUrls?.[0]
  ? item.imageUrls[0].startsWith("http")
    ? item.imageUrls[0]
    : `https://reactnativeproject.onrender.com/${item.imageUrls[0]}`
  : "https://via.placeholder.com/150";


  return { handleNavigate, imageUrl };
}
