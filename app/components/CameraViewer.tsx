import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

const CAMERA = require("../../assets/images/camera.jpg");

// camera image is 421 x 735
const RATIO = 735 / 421;

// how much of the screen width the camera takes up
const WIDTH_FRACTION = 0.86;

// the black screen rectangle, as fractions of the camera image
const SCREEN = { left: 0.081, top: 0.156, width: 0.681, height: 0.508 };

interface CameraViewerProps {
  photos: string[];
  startIndex: number | null; // null = closed
  onClose: () => void;
}

// Render as the LAST child inside a modal's overlay so it sits on top.
export default function CameraViewer({
  photos,
  startIndex,
  onClose,
}: CameraViewerProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // jump to the tapped photo whenever the camera opens
  useEffect(() => {
    if (startIndex !== null) setIndex(startIndex);
  }, [startIndex]);

  if (startIndex === null || photos.length === 0) return null;

  let w = screenW * WIDTH_FRACTION;
  let h = w * RATIO;
  if (h > screenH * 0.9) {
    h = screenH * 0.9;
    w = h / RATIO;
  }

  const current = Math.min(index, photos.length - 1);
  const many = photos.length > 1;
  const prev = () => setIndex((current - 1 + photos.length) % photos.length);
  const next = () => setIndex((current + 1) % photos.length);

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={[styles.camera, { width: w, height: h }]}>
        <Image
          source={CAMERA}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />

        {/* black screen: photo fits inside, black fills any empty space */}
        <View
          style={{
            position: "absolute",
            left: SCREEN.left * w,
            top: SCREEN.top * h,
            width: SCREEN.width * w,
            height: SCREEN.height * h,
            backgroundColor: "black",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: photos[current] }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
          />

          {many && (
            <>
              <Pressable
                onPress={prev}
                hitSlop={10}
                style={[styles.arrow, styles.arrowLeft]}
                accessibilityLabel="Previous photo"
              >
                <ThemedText style={styles.arrowText}>‹</ThemedText>
              </Pressable>
              <Pressable
                onPress={next}
                hitSlop={10}
                style={[styles.arrow, styles.arrowRight]}
                accessibilityLabel="Next photo"
              >
                <ThemedText style={styles.arrowText}>›</ThemedText>
              </Pressable>

              <View style={styles.counter} pointerEvents="none">
                <ThemedText style={styles.counterText}>
                  {current + 1} / {photos.length}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  camera: {
    borderRadius: 28,
    overflow: "hidden",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  arrowText: {
    color: "white",
    fontSize: 26,
    lineHeight: 30,
    marginTop: -2,
  },
  counter: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  counterText: {
    color: "white",
    fontSize: 12,
  },
});
