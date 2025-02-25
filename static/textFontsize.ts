import { Platform, StyleSheet } from "react-native";
export const Textstyles = StyleSheet.create({
  text_xsmall: {
    fontFamily: "TTFirsNeue",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 21,
  },
  text_x16small: {
    fontFamily: "TTFirsNeue",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 20,
  },
  text_xsma: {
    fontFamily: "TTFirsNeue",
    fontSize: Platform.OS === "android" ? 12 : 14,
    fontWeight: 200,
    color: "grey",
  },
  text_small: {
    fontFamily: "TTFirsNeue",
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 27,
  },
  text_medium: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 30,
  },
  text_xxmedium: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 30,
  },
  text_button: {
    fontFamily: "TTFirsNeue",
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 27,
  },
  text_xmedium: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 20,
  },
  text_cmedium: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 30,
  },
  text_c: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 30,
  },
  text_cc: {
    fontFamily: "TTFirsNeueMedium",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 30,
  },
});
