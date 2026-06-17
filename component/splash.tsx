import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import FirstSvg from "../assets/first.svg";
import SecondSvg from "../assets/2nd.svg";
import ThirdSvg from "../assets/3rd.svg";
import FourthSvg from "../assets/4th.svg";
import AcePick from "../assets/acepick.svg";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { useRouter } from "expo-router";
import EmptyView from "./emptyview";
import { Textstyles } from "../static/textFontsize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRole } from "../context/roleContext";

const ONBOARDING_KEY = "hasSeenOnboarding";

const Splash = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, primaryTextColor, secondaryTextColor, backgroundColor } =
    getColors(theme);
  const { dispatch: roleDispatch } = useRole();

  const slides = [
    {
      svg: <FirstSvg />,
      image: require("../assets/first.png"),
      header: "Welcome to Acepick",
      body: "Your gateway to a world of possibilities. Connect with skilled professionals, explore a transparent marketplace, and experience secure transactions. Join us on this journey where clients and professionals thrive together.",
    },
    {
      svg: <SecondSvg />,
      image: require("../assets/2nd.png"),
      header: "Direct Connections, Seamless Chats",
      body: "Clients, engage in direct chats with professionals across sectors. Discuss projects, explore services, and build connections. Acepick simplifies communication for a personalized and efficient experience.",
    },
    {
      svg: <ThirdSvg />,
      image: require("../assets/3rd.png"),
      header: "Explore the Marketplace",
      body: "Discover our Marketplace, where you can confirm prices of items, explore businesses, and find the best deals. Acepick is committed to transparency, ensuring a seamless experience whether you're hiring professionals or exploring the market.",
    },
    {
      svg: <FourthSvg />,
      image: require("../assets/4th.png"),
      header: "Secure Transactions, Effortless Works",
      body: "Acepick prioritizes your security. Experience secure transactions, transparent processes, and an intuitive platform. Clients, approve invoices with ease, and professionals, showcase your skills and create invoices effortlessly. Acepick, where every connection leads to success.",
    },
  ];

  // null = still checking AsyncStorage, false = first time, true = returning user
  const [ready, setReady] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(slides.length).fill(true)
  );
  const [imageLoadError, setImageLoadError] = useState<boolean[]>(
    new Array(slides.length).fill(false)
  );

  // "Who are you?" is the virtual last step (index === slides.length)
  const isRoleStep = currentScreen === slides.length;
  const isLastSlide = currentScreen === slides.length - 1;
  const height = Dimensions.get("window").height;

  // Check onboarding flag — redirect returning users straight to login
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (value === "true") {
        router.replace("/loginscreen");
      } else {
        setReady(false);
      }
    });
  }, []);

  // Mark onboarding complete and navigate to the chosen role's login
  const finishOnboarding = async (
    role: "client" | "artisan" | "delivery",
    loginRoute: string
  ) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    roleDispatch({ type: "SET_ROLE", payload: role });
    router.replace(loginRoute as any);
  };

  // SKIP always jumps straight to "Who are you?"
  const handleSkip = () => setCurrentScreen(slides.length);

  const handleNext = () => {
    if (currentScreen < slides.length - 1) {
      setCurrentScreen((s) => s + 1);
    } else {
      // Last slide → advance to "Who are you?"
      setCurrentScreen(slides.length);
    }
  };

  const renderSlideImage = () => {
    const slide = slides[currentScreen];
    if (!slide) return null;

    if (slide.svg && !imageLoadError[currentScreen]) {
      return (
        <View className="w-full h-full relative">
          {slide.svg}
          {!imagesLoaded[currentScreen] && (
            <View className="absolute inset-0 justify-center items-center bg-white/50">
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          )}
        </View>
      );
    }

    return (
      <View className="w-full h-full relative">
        <Image
          source={slide.image}
          style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          onLoad={() =>
            setImagesLoaded((prev) => {
              const next = [...prev];
              next[currentScreen] = true;
              return next;
            })
          }
          onError={() =>
            setImageLoadError((prev) => {
              const next = [...prev];
              next[currentScreen] = true;
              return next;
            })
          }
        />
        {!imagesLoaded[currentScreen] && (
          <View className="absolute inset-0 justify-center items-center bg-white/50">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}
      </View>
    );
  };

  // Still reading AsyncStorage — keep native splash visible
  if (ready === null) return null;

  // ── "Who are you?" screen ────────────────────────────────────────────────────
  if (isRoleStep) {
    return (
      <View
        style={{ flex: 1, backgroundColor }}
        className="flex items-center justify-center px-8"
      >
        <StatusBar style="auto" />

        {/* Logo */}
        <AcePick />

        <EmptyView height={6} />

        {/* Title */}
        <Text
          style={[Textstyles.text_medium, { color: primaryTextColor }]}
          className="text-2xl font-bold text-center"
        >
          Who are you?
        </Text>

        {/* Dots — all 4 filled + role dot active */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 16, marginBottom: 32 }}>
          {[...slides, null].map((_, i) => (
            <View
              key={i}
              style={{
                height: 6,
                width: i === slides.length ? 20 : 6,
                borderRadius: 3,
                backgroundColor: i === slides.length ? primaryColor : primaryColor + "40",
              }}
            />
          ))}
        </View>

        {/* Role buttons */}
        <View className="w-full flex items-center" style={{ gap: 14 }}>
          {/* Client */}
          <TouchableOpacity
            onPress={() =>
              finishOnboarding("client", "/(NotAuthenticated)/loginscreen")
            }
            style={{ borderColor: primaryColor, borderWidth: 2 }}
            className="w-full rounded-xl py-4"
          >
            <Text
              style={[Textstyles.text_cmedium, { color: primaryColor }]}
              className="text-center text-lg font-semibold"
            >
              Client
            </Text>
          </TouchableOpacity>

          {/* Professional */}
          <TouchableOpacity
            onPress={() =>
              finishOnboarding(
                "artisan",
                "/(NotAuthenticated)/(professionAuth)/loginprofession"
              )
            }
            style={{ backgroundColor: primaryColor }}
            className="w-full rounded-xl py-4"
          >
            <Text
              style={[Textstyles.text_cmedium, { color: "#ffffff" }]}
              className="text-center text-lg font-semibold"
            >
              Professional
            </Text>
          </TouchableOpacity>

          {/* Delivery */}
          <TouchableOpacity
            onPress={() =>
              finishOnboarding(
                "delivery",
                "/(NotAuthenticated)/(professionAuth)/loginprofession"
              )
            }
            style={{ borderColor: primaryColor, borderWidth: 2 }}
            className="w-full rounded-xl py-4"
          >
            <Text
              style={[Textstyles.text_cmedium, { color: primaryColor }]}
              className="text-center text-lg font-semibold"
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Slide screens (1-4) ──────────────────────────────────────────────────────
  return (
    <View className="h-full w-full">
      <StatusBar style="auto" />

      {/* Top image */}
      <View className="w-full" style={{ height: height * 0.5 }}>
        {renderSlideImage()}
      </View>

      {/* Bottom content card */}
      <View
        style={{ height: height * 0.5, backgroundColor }}
        className="w-full absolute bottom-0 z-50 p-8 rounded-t-3xl"
      >
        {/* Progress dots — 5 total (4 slides + role step) */}
        <View className="flex-row justify-between mb-6">
          {[...slides, null].map((_, index) => (
            <View
              key={index}
              style={{
                height: 4,
                flex: 1,
                marginHorizontal: 3,
                borderRadius: 2,
                backgroundColor:
                  index <= currentScreen ? primaryColor : primaryColor + "30",
              }}
            />
          ))}
        </View>

        {/* Header */}
        <Text
          style={[Textstyles.text_medium, { color: primaryTextColor }]}
          className="font-bold"
        >
          {slides[currentScreen].header}
        </Text>

        <EmptyView height={3} />

        {/* Body */}
        <Text
          style={[Textstyles.text_x16small, { color: secondaryTextColor }]}
          className={`${Platform.OS === "ios" ? "text-lg" : "text-sm"} leading-relaxed`}
        >
          {slides[currentScreen].body}
        </Text>

        <EmptyView height={8} />

        {/* Buttons */}
        {isLastSlide ? (
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={handleNext}
              style={{ backgroundColor: primaryColor }}
              className="px-8 py-3 rounded-full"
            >
              <Text
                style={[Textstyles.text_cmedium, { color: "#ffffff" }]}
                className="font-bold"
              >
                GET STARTED
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="h-5" />
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={handleSkip}>
                <Text
                  style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}
                  className="font-semibold"
                >
                  SKIP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                style={{ backgroundColor: primaryColor }}
                className="rounded-full w-12 h-12 flex-row items-center justify-center shadow-lg"
              >
                <AntDesign name="arrowright" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Splash;
