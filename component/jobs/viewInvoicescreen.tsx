import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import Divider from "component/divider";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import React from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchInvoice } from "services/userService";
import { currency } from "./invoiceScreen";

const ViewInvoiceScreen = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const {
    data: invoice,
    isFetching,
  } = useQuery({
    queryKey: ["viewInvoice", jobId],
    queryFn: () => fetchInvoice(Number(jobId)),
    enabled: !!jobId,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const workmanship = Number(invoice?.workmanship ?? 0);
  const materialsCost = Number(invoice?.materialsCost ?? 0);
  const grandTotal = workmanship + materialsCost;
  const materials = invoice?.materials ?? [];

  if (isFetching) {
    return (
      <ContainerTemplate>
        <View className="w-full h-full justify-center items-center">
          <ActivityIndicator color={primaryColor} size="large" />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            Loading invoice...
          </ThemeTextsecond>
        </View>
      </ContainerTemplate>
    );
  }

  if (!invoice) {
    return (
      <ContainerTemplate>
        <HeaderComponent title="View Invoice" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="document-text-outline" size={56} color={secondaryTextColor + "40"} />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_small}>
            Invoice not found
          </ThemeTextsecond>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <ContainerTemplate>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeaderComponent title="View Invoice" />
        <EmptyView height={20} />

        {/* ─── Status Badge ───────────────────────────── */}
        <View className="flex-row items-center mb-4">
          <View
            style={{
              backgroundColor:
                invoice.status === "APPROVED"
                  ? primaryColor + '20'
                  : invoice.status === "ONGOING"
                  ? primaryColor + '20'
                  : backgroundColortwo + '20',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  invoice.status === "APPROVED"
                    ? primaryColor
                    : invoice.status === "ONGOING"
                    ? primaryColor
                    : backgroundColortwo,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                color:
                  invoice.status === "APPROVED"
                    ? primaryColor
                    : invoice.status === "ONGOING"
                    ? primaryColor
                    : backgroundColortwo,
                fontSize: 13,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* ─── Job Info Card ──────────────────────────── */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-4"
        >
          <View className="flex-row items-center mb-3">
            <View
              style={{ backgroundColor: primaryColor + "20" }}
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
            >
              <MaterialIcons name="work" size={16} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_small}>Job Details</ThemeText>
          </View>

          <Text
            style={{
              color: primaryColor,
              fontSize: 18,
              fontFamily: "TTFirsNeueMedium",
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {invoice.title}
          </Text>

          {invoice.description ? (
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              {invoice.description}
            </ThemeTextsecond>
          ) : null}

          <EmptyView height={12} />
          <Divider />
          <EmptyView height={12} />

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} style={{ marginRight: 6 }} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {formatDate(invoice.createdAt)}
              </ThemeTextsecond>
            </View>
            {invoice.durationValue && invoice.durationUnit ? (
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color={secondaryTextColor} style={{ marginRight: 6 }} />
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                  {invoice.durationValue} {invoice.durationUnit}
                </ThemeTextsecond>
              </View>
            ) : null}
          </View>
        </View>

        {/* ─── Workmanship Card ────────────────────────── */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: primaryColor + '20' }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <MaterialIcons name="engineering" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small}>Workmanship</ThemeText>
            </View>
            <Text
              style={{
                color: primaryColor,
                fontSize: 18,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {currency(workmanship)}
            </Text>
          </View>
        </View>

        {/* ─── Materials Card ─────────────────────────── */}
        {materials.length > 0 && (
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: backgroundColortwo + '20' }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="cube-outline" size={16} color={backgroundColortwo} />
              </View>
              <ThemeText size={Textstyles.text_small}>Materials</ThemeText>
              <View
                style={{ backgroundColor: primaryColor }}
                className="ml-2 w-6 h-6 rounded-full items-center justify-center"
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                  {materials.length}
                </Text>
              </View>
            </View>

            {materials.map((mat: any, idx: number) => (
              <View
                key={mat.id ?? idx}
                style={{
                  borderWidth: 1,
                  borderColor: secondaryTextColor + "15",
                }}
                className="flex-row justify-between items-center px-3 py-3 rounded-xl mb-2"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    style={{ backgroundColor: primaryColor + "15" }}
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  >
                    <Ionicons name="cube" size={16} color={primaryColor} />
                  </View>
                  <View className="flex-1">
                    <ThemeText size={Textstyles.text_xsmall}>
                      {mat.description}
                    </ThemeText>
                    <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                      {mat.quantity} {mat.unit} × {currency(mat.price)}
                    </ThemeTextsecond>
                  </View>
                </View>
                <Text
                  style={{
                    color: primaryColor,
                    fontSize: 14,
                    fontFamily: "TTFirsNeueMedium",
                  }}
                >
                  {currency(mat.subTotal ?? mat.price * mat.quantity)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── Grand Total Card ───────────────────────── */}
        <View
          style={{
            backgroundColor: selectioncardColor,
            borderWidth: 1,
            borderColor: primaryColor + "30",
          }}
          className="rounded-2xl px-4 py-4 mb-4"
        >
          <View className="flex-row justify-between items-center mb-2">
            <ThemeTextsecond size={Textstyles.text_small}>Workmanship</ThemeTextsecond>
            <ThemeText size={Textstyles.text_small}>
              {currency(workmanship)}
            </ThemeText>
          </View>
          {materials.length > 0 && (
            <View className="flex-row justify-between items-center mb-3">
              <ThemeTextsecond size={Textstyles.text_small}>Materials</ThemeTextsecond>
              <ThemeText size={Textstyles.text_small}>
                {currency(materialsCost)}
              </ThemeText>
            </View>
          )}
          <Divider />
          <EmptyView height={10} />
          <View className="flex-row justify-between items-center">
            <Text
              style={{
                color: primaryColor,
                fontSize: 16,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              Grand Total
            </Text>
            <Text
              style={{
                color: primaryColor,
                fontSize: 22,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {currency(grandTotal)}
            </Text>
          </View>
        </View>

        <EmptyView height={30} />
      </ScrollView>
    </ContainerTemplate>
  );
};

export default ViewInvoiceScreen;