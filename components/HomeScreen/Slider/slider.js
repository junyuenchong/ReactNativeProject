import React, { useEffect, useRef, useState, useCallback } from "react";
import { images } from "../../../api/models/Image";
import {
  FlatList,
  Image,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";

function slider() {
  const flatlistRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
      flatlistRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true, // FIXED typo: "animation" → "animated"
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // Optimize FlatList layout calculation
  const getItemLayout = (data, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  // Optimize scroll handler
  const handleScroll = useCallback((event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  }, []);

  // Render each image
  const renderItem = useCallback(({ item }) => (
    <Image
      source={{ uri: item.img }}
      style={styles.image}
      resizeMode="cover"
    />
  ), []);

  // Render dot indicators
  const renderDotIndicators = () => (
    <View style={styles.dotsContainer}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: activeIndex === index ? "green" : "red" },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View>
      <FlatList
        data={images}
        ref={flatlistRef}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={0}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {renderDotIndicators()}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: Dimensions.get("window").width,
    marginVertical: 5,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});

export default slider;
