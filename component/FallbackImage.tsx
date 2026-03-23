import React, { useState } from "react";
import { Image, ImageProps, ImageSourcePropType } from "react-native";

const FALLBACK_IMAGE = require("../assets/homebg.png");

interface FallbackImageProps extends Omit<ImageProps, "source"> {
  source: ImageSourcePropType;
  fallbackSource?: ImageSourcePropType;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  source,
  fallbackSource = FALLBACK_IMAGE,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      source={failed ? fallbackSource : source}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};

export default FallbackImage;
