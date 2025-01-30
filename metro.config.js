const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  // Get the default configuration
  const config = getDefaultConfig(__dirname);

  // Add the SVG transformer
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  // Modify the resolver for SVG and include NativeWind input
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...config.resolver.sourceExts, "svg"],
  };
  config.resolver.extraNodeModules = {
    "@pages": require("path").resolve(__dirname, "./pages"),
  };

  // Wrap with NativeWind configuration
  return withNativeWind(config, { input: "./global.css" });
})();
