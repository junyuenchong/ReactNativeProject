import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { UserContext, UserType } from "../../UserContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImageManipulator from "expo-image-manipulator";
const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [colour, setColour] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPath, setNewPath] = useState("");
  const [newIcon, setNewIcoon] = useState("");
  const [images, setImages] = useState([]); // for newly selected images
  const [existingImages, setExistingImages] = useState([]); // for edit mode only
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // Default to "All Categories"
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigation = useNavigation();
  // const [randomProducts, setRandomProducts] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [alertShown, setAlertShown] = useState(false); // State to track if alert has been shown
  const [randomProduct, setRandomProduct] = useState(null); // Initialize with null
  const [noProductsFound, setNoProductsFound] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authAdminToken");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
      console(userId);
    };

    fetchUser();
  }, []);
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // TextInput direct search
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setNoProductsFound(false); // Reset before search
    try {
      const response = await axios.get("https://reactnativeproject.onrender.com/fetchproducts", {
        params: {
          query: searchQuery, // search by product name
          category: selectedCategory === "all" ? "" : selectedCategory, // search by category
        },
      });
      // Randomize the products before setting them
      const fetchedProducts = response.data;
      if (fetchedProducts.length === 0) {
        // Alert.alert("No Products", "No products found...");
        setNoProductsFound(true); // ✅ Show "No products" text
      } else {
        const randomProducts = fetchedProducts.sort(() => Math.random() - 0.5);
        setProducts(randomProducts);
      }

      // if (response.data.length === 0) {
      //   Alert.alert(
      //     "No Products",
      //     "No products found for the selected category or search term."
      //   );
      // }

      // setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://reactnativeproject.onrender.com/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  // Fetch products when selectedCategory changes
  // useEffect(() => {
  //   fetchProducts();
  // }, [selectedCategory]);

  const handleAddCategory = async () => {
    if (!newCategory) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    try {
      const response = await axios.post("https://reactnativeproject.onrender.com/categories", {
        name: newCategory,
        path: newPath,
        icon: newIcon,
      });
      Alert.alert("Added Category ", "Sucessfully!");
      setCategories([...categories, response.data]);
      setNewCategory("");
      resetForm();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setNewPath(category.path);
    setNewIcoon(category.icon);
    setCategoryModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    if (!newCategory) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    try {
      const response = await axios.put(
        `https://reactnativeproject.onrender.com/categories/${editingCategory._id}`,
        {
          name: newCategory,
        }
      );
      setCategories(
        categories.map((cat) =>
          cat._id === editingCategory._id ? response.data : cat
        )
      );
      setNewCategory("");
      setEditingCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`https://reactnativeproject.onrender.com/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleSubmit = async () => {
    const totalImages = images.length + existingImages.length;

    // Validate: Category must be selected
    if (!category) {
      Alert.alert("Validation Error", "Please select a product category.");
      return;
    }

    // Validate: Minimum of 3 images required
    if (totalImages < 3) {
      Alert.alert(
        "Validation Error",
        "Please upload at least 3 product images."
      );
      return;
    }

    // Validate: All other fields are empty (optional)
    if (!name && !price && !colour && !description && !offer && !oldPrice) {
      Alert.alert(
        "Validation Error",
        "Please fill in at least one product detail."
      );
      return;
    }

    setLoading(true); // Start loading before the update process begins

    // Add a delay before proceeding with the update
    setTimeout(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("colour", colour);
      formData.append("description", description);
      formData.append("offer", offer);
      formData.append("oldPrice", oldPrice);
      // Append new images
      images.forEach((image) => {
        formData.append("image", {
          uri: image.uri,
          type: "image/jpeg",
          name: image.name,
        });
      });

      // Send existing images for edit
      if (editingProduct) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      // Common header for both POST and PUT requests
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      try {
        let response;

        if (editingProduct) {
          // Update product request (PUT)
          response = await axios.put(
            `https://reactnativeproject.onrender.com/products/${editingProduct._id}`,
            formData,
            { headers }
          );

          // Update the product list with the updated product
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === response.data._id ? response.data : p
            )
          );

          // Display success alert only once
          if (!alertShown) {
            Alert.alert("Success", "Product updated successfully!");
            setAlertShown(true); // Set alertShown to true after the alert is displayed
          }
        } else {
          // Add new product request (POST)
          response = await axios.post(
            "https://reactnativeproject.onrender.com/products",
            formData,
            {
              headers,
            }
          );

          if (response.data) {
            // Add the new product to the local product list
            setProducts((prevProducts) => [...prevProducts, response.data]);
          } else {
            console.error("No product data received in response");
          }
        }
        resetForm(); // Reset the form after successful submission

        // Optionally, fetch products again (only if needed)
        fetchProducts();
      } catch (error) {
        console.error("Error saving product:", error);
        if (error.response) {
          console.error("Response Data:", error.response.data);
          console.error("Response Status:", error.response.status);
        }
      } finally {
        setLoading(false); // End loading after the request is complete
      }
    }, 3000); // Delay of 2000 milliseconds (2 seconds)
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category ? product.category._id : "");
    setPrice(product.price);
    setColour(product.colour);
    setDescription(product.description);
    setOffer(product.offer);
    setOldPrice(product.oldPrice);
    setExistingImages(product.imageUrls || []);
    setImages([]); // clear new uploads
    setModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`https://reactnativeproject.onrender.com/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      // ✅ Show remove product success alert
      Alert.alert("Deleted", "Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setImages([]);
    setExistingImages([]);
    setPrice("");
    setColour("");
    setDescription("");
    setOffer("");
    setOldPrice("");
    setEditingProduct(null);
    setModalVisible(false);
    setCategoryModalVisible(false);
  };

  const handleImagePicker = async () => {
    const totalImageCount = images.length + existingImages.length;

    // Enforce a strict limit of 3 images
    if (totalImageCount >= 3) {
      Alert.alert("Image Limit Reached", "You can only upload up to 3 images.");
      return;
    }
    // Launch image picker with a limit to the remaining slots
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - totalImageCount, // Account for the remaining slots
      allowsEditing: false,     
      quality: 0.7, // Optimal image quality for mobile upload
      aspect: [1, 1], // Crop the image to a square
    });

    if (!result.canceled && result.assets) {
      const selectedImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `image_${Date.now()}`, // Generate fallback name if missing
      }));

      const newTotal =
        images.length + existingImages.length + selectedImages.length;

      // Ensure that the total count does not exceed the limit
      if (newTotal > 3) {
        Alert.alert(
          "Image Limit Exceeded",
          "You selected more than 3 images. Please try again."
        );
        return;
      }

      setImages((prevImages) => [...prevImages, ...selectedImages]);
    }
  };

  const onLogout = async () => {
    // Clear AsyncStorage
    await AsyncStorage.removeItem("authAdminToken");
    navigation.navigate("Login"); // Navigate back to login screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Admin Management</Text>
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Icon name="logout" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Products"
        value={searchQuery}
        onChangeText={setSearchQuery} // Update the search query state
        onSubmitEditing={fetchProducts} // Trigger fetch when user submits the query
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => {
          fetchProducts(); // Fetch products based on the search query
        }}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="all" />
        {categories.map((cat) => (
          <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
        ))}
      </Picker>

      <View>
        {/* Horizontal ScrollView for Categories */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {/* Category Button = all */}
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "all" && styles.selectedCategoryButton,
            ]}
            onPress={() =>
              navigation.navigate("FetchProduct", { categoryId: "all" })
            }
          >
            <Text style={styles.categoryButtonText}>All Categories</Text>
          </TouchableOpacity>
          {/* Category Button = category database*/}
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[
                styles.categoryButton,
                selectedCategory === cat._id && styles.selectedCategoryButton,
              ]}
              onPress={() =>
                navigation.navigate("FetchProduct", { categoryId: cat._id })
              }
            >
              <Text style={styles.categoryButtonText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          width: 400,
          backgroundColor: "#FEBE10",
          borderRadius: 6,
          padding: 15,
          alignSelf: "center",
        }}
      >
        <Text
          style={{ textAlign: "center", color: "black", fontWeight: "bold" }}
        >
          Add New Product
        </Text>
      </Pressable>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : noProductsFound ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 16,
            color: "gray",
          }}
        >
          No products found.
        </Text>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={products}
            keyExtractor={(item) => item._id.toString()}
            // Ensures the FlatList scrolls vertically (default behavior)
            horizontal={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                {/* Loop through the imageUrls array and display the images */}
                {/* {item.imageUrls?.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: `http://10.0.2.2:8000/${item.imageUrls[0]}` }}// Constructing the image URL
                    style={styles.productImage}
                  />
                ))} */}

          {/* Loop through the imageUrls array[0] and display the images */}
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <Image
                    source={{
                      uri: `https://reactnativeproject.onrender.com/${item.imageUrls[0]}`,
                    }}
                    style={styles.productImage}
                  />
                )}

                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>
                    {item.category ? item.category.name : "No Category"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleEditProduct(item)}
                  style={styles.editButton}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Confirm Delete",
                      `Are you sure you want to delete ${item.name}?`,
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDeleteProduct(item._id),
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <Text style={styles.subtitle}>Manage Categories</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.categoryItem}>
                <Text style={styles.categoryName}>{item.name}</Text>

                <TouchableOpacity
                  onPress={() => handleEditCategory(item)}
                  style={styles.editButton}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(item._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
      <View>
        <FlatList
          data={products}
          horizontal
          keyExtractor={(item) => item._id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageScrollContainer}
              >
                {(item.imageUrls?.length > 0
                  ? item.imageUrls
                  : [item.imageUrl]
                ).map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: `https://reactnativeproject.onrender.com/${url}` }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCategory}>
                {item?.category?.name || "No Category"}
              </Text>
            </View>
          )}
        />
      </View>
      <Pressable
        onPress={fetchProducts}
        style={{
          width: 400,
          backgroundColor: "#FEBE10",
          borderRadius: 6,
          padding: 15,
          alignSelf: "center",
          margin: 10,
        }}
      >
        <Text
          style={{ textAlign: "center", color: "black", fontWeight: "bold" }}
        >
          Fetch Random Product
        </Text>
      </Pressable>

      <TouchableOpacity
        style={{
          width: 400,
          backgroundColor: "#FEBE10",
          borderRadius: 6,
          padding: 15,
          alignSelf: "center",
        }}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text
          style={{ textAlign: "center", color: "black", fontWeight: "bold" }}
        >
          Add New Category
        </Text>
      </TouchableOpacity>

      {/* Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 20,
                textAlign: "center",
                marginBottom: 15,
              }}
            >
              {editingProduct ? "Edit Product" : "Add Product"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={name}
              onChangeText={setName}
            />

            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
              ))}
            </Picker>

            <TouchableOpacity
              onPress={handleImagePicker}
              style={{
                backgroundColor: "#FEBE10",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
                Pick Image
              </Text>
            </TouchableOpacity>

            {/* uploading images */}
            <Text style={{ marginVertical: 8, color: "gray" }}>
              You can upload {3 - existingImages.length - images.length} more
              image(s).
            </Text>

            {/* Display selected or existing images */}
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {existingImages.map((url, index) => (
                <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Image
                    source={{ uri: `http://10.0.2.2:8000/${url}` }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const updated = [...existingImages];
                      updated.splice(index, 1);
                      setExistingImages(updated);
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "red",
                      padding: 2,
                    }}
                  >
                    <Text style={{ color: "white" }}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {images.map((img, index) => (
                <View
                  key={`picked-${index}`}
                  style={{ marginRight: 8, marginBottom: 8 }}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const updatedImages = [...images];
                      updatedImages.splice(index, 1);
                      setImages(updatedImages);
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "red",
                      padding: 2,
                    }}
                  >
                    <Text style={{ color: "white" }}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Product Price RM"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Product Colour"
              value={colour}
              onChangeText={setColour}
            />
            <TextInput
              style={styles.input}
              placeholder="Product Description"
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              style={styles.input}
              placeholder="Product Offer"
              value={offer}
              onChangeText={setOffer}
            />

            <TextInput
              style={styles.input}
              placeholder="Product Old Pricee"
              value={oldPrice}
              onChangeText={setOldPrice}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: "#FEBE10", // Button background color
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={resetForm}
              style={{
                backgroundColor: "red", // light gray background
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 6,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Path"
              value={newPath}
              onChangeText={setNewPath}
            />
            <TextInput
              style={styles.input}
              placeholder="Icon"
              value={newIcon}
              onChangeText={setNewIcoon}
            />
            <Button
              title={editingCategory ? "Update Category" : "Add Category"}
              onPress={
                editingCategory ? handleUpdateCategory : handleAddCategory
              }
            />
            <Button
              title="Cancel"
              onPress={() => setCategoryModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // pushes icon to the right
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5", // optional
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    // optional styling for button
    padding: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 16,
  },
  productItem: {
    height: 80,
    flexDirection: "row",
    alignItems: "left",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  productImage: {
    width: 40,
    height: 50,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    color: "gray",
  },
  editButton: {
    backgroundColor: "#FEBE10",
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
  },
  buttonText: {
    color: "black",
    fontSize: 14,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  categoryScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: "#FEBE10",
  },
  randomproductItem: {
    paddingHorizontal: 10,
    flexDirection: "column", // Column layout for product item
    alignItems: "center",
  },
  randomproductImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 8, // Optional for rounded images
  },
  randomproductDetailsRow: {
    flexDirection: "row", // Row layout for product details (name + category)
    alignItems: "center", // Center content vertically
    marginTop: 10,
  },
  randomproductName: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10, // Add space between the name and category
  },
  randomproductCategory: {
    fontSize: 14,
    color: "gray",
  },
  EditandDeletebutton: {
    marginleft: 500,
  },
});

export default AdminPage;
