import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
  } from 'react-native';
  import { useQuery } from '@tanstack/react-query';
  import { useLocalSearchParams, useRouter } from 'expo-router';
  import { useTheme } from 'hooks/useTheme';
  import {
    ThemeText,
    ThemeTextsecond,
  } from 'component/ThemeText';
  import { Ionicons } from '@expo/vector-icons';
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import EmptyView from 'component/emptyview';
  import HeaderComponent from 'component/headerComp';
  import ButtonComponent from 'component/buttoncomponent';
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import React, { useState } from 'react';
  import { fetchInvoice } from 'services/userService';
  import { Material } from 'types/type';
  import { store } from 'redux/store';
  
  const currency = (n: number | null | undefined) =>
    `₦${(n ?? 0).toLocaleString()}`;
  
  const InvoiceViewScreen = () => {
    const params = useLocalSearchParams();
    const jobId = params.jobId as string;
    const role: string = store.getState().auth.user?.role || 'client';
    const router = useRouter();
    const { theme } = useTheme();
    const {
      primaryColor,
      secondaryTextColor,
      selectioncardColor,
      borderColor,
      successColor,
      warningColor,
      backgroundColortwo,
    } = getColors(theme);
  
    const [showMat, setShowMat] = useState(false);
  
    const {
      data: invoice,
      isFetching,
      error,
    } = useQuery({
      queryKey: ['invoice', jobId],
      queryFn: () => fetchInvoice(jobId!),
      enabled: !!jobId,
    });
  
    if (isFetching) {
      return (
        <ContainerTemplate>
          <View className="w-full h-full justify-center items-center">
            <ActivityIndicator color={primaryColor} size="large" />
            <Text style={{ color: secondaryTextColor, marginTop: 12, fontSize: 13 }}>
              Loading invoice...
            </Text>
          </View>
        </ContainerTemplate>
      );
    }

    if (!invoice || error) {
      return (
        <ContainerTemplate>
          <HeaderComponent title="Invoice" />
          <View className="flex-1 items-center justify-center px-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: backgroundColortwo + '20' }}
            >
              <Ionicons name="receipt-outline" size={36} color={backgroundColortwo} />
            </View>
            <ThemeText size={Textstyles.text_cmedium}>
              {error ? 'Failed to load invoice' : 'Invoice not found'}
            </ThemeText>
            <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Please try again later or contact support.
            </Text>
          </View>
        </ContainerTemplate>
      );
    }
  
    const materialsTotal = invoice.materials.reduce((acc: number, m: Material) => acc + m.subTotal, 0);
    const workmanship = parseFloat(String(invoice?.workmanship ?? '0'));
    const grandTotal = materialsTotal + workmanship;
    const isPaid = invoice.payStatus !== 'unpaid';
  
    return (
      <ContainerTemplate>
        <View className="flex-1">
          <HeaderComponent title="Invoice" />
  
          <ScrollView
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header card ── */}
            <View
              style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
              className="rounded-2xl mx-1 mb-4 overflow-hidden"
            >
              {/* Top accent bar */}
              <View style={{ height: 4, backgroundColor: primaryColor }} />

              <View className="p-4">
                {/* Title + edit */}
                <View className="flex-row items-start justify-between">
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: secondaryTextColor, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 }}>
                      INVOICE
                    </Text>
                    <ThemeText size={Textstyles.text_small}>{invoice.title}</ThemeText>
                  </View>
                  {role === 'professional' && (
                    <TouchableOpacity
                      onPress={() => router.push(`/editinvoiceLayout?jobId=${jobId}`)}
                      className="flex-row items-center px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: primaryColor + '15', gap: 4 }}
                    >
                      <Ionicons name="create-outline" size={14} color={primaryColor} />
                      <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Description */}
                <Text style={{ color: secondaryTextColor, fontSize: 13, lineHeight: 18, marginTop: 8 }}>
                  {invoice.description}
                </Text>

                {/* Meta row */}
                <View className="flex-row flex-wrap mt-3" style={{ gap: 12 }}>
                  <MetaChip icon="navigate-outline" label={invoice.mode} color={secondaryTextColor} />
                  {invoice.fullAddress && (
                    <MetaChip icon="location-outline" label={invoice.fullAddress} color={secondaryTextColor} />
                  )}
                  {invoice.durationValue && (
                    <MetaChip
                      icon="time-outline"
                      label={`${invoice.durationValue} ${invoice.durationUnit}`}
                      color={secondaryTextColor}
                    />
                  )}
                </View>

                {/* Payment status badge */}
                <View className="mt-3">
                  <View
                    className="flex-row items-center self-start rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: isPaid ? successColor + '15' : warningColor + '15',
                      gap: 5,
                    }}
                  >
                    <Ionicons
                      name={isPaid ? 'checkmark-circle' : 'time-outline'}
                      size={14}
                      color={isPaid ? successColor : warningColor}
                    />
                    <Text style={{ color: isPaid ? successColor : warningColor, fontSize: 11, fontWeight: '600' }}>
                      {isPaid ? 'Paid' : 'Awaiting Payment'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Cost breakdown ── */}
            <View
              style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
              className="rounded-2xl mx-1 mb-4 p-4"
            >
              <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
                <Ionicons name="calculator-outline" size={16} color={primaryColor} />
                <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                  COST BREAKDOWN
                </Text>
              </View>

              <CostRow label="Workmanship" amount={workmanship} color={secondaryTextColor} />
              <CostRow label="Materials" amount={materialsTotal} color={secondaryTextColor} />

              <View
                className="mt-3 pt-3 flex-row justify-between items-center"
                style={{ borderTopWidth: 1, borderTopColor: borderColor }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: secondaryTextColor }}>
                  Total
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: primaryColor }}>
                  {currency(grandTotal)}
                </Text>
              </View>
            </View>

            {/* ── Materials list (expandable) ── */}
            {invoice.materials.length > 0 && (
              <View
                style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
                className="rounded-2xl mx-1 mb-4 overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => setShowMat(!showMat)}
                  className="flex-row items-center justify-between p-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Ionicons name="cube-outline" size={16} color={primaryColor} />
                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                      MATERIALS ({invoice.materials.length})
                    </Text>
                  </View>
                  <Ionicons
                    name={showMat ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={secondaryTextColor}
                  />
                </TouchableOpacity>

                {showMat && (
                  <View className="px-4 pb-4" style={{ gap: 8 }}>
                    {invoice.materials.map((m: Material) => (
                      <View
                        key={m.id}
                        className="flex-row items-center justify-between rounded-xl p-3"
                        style={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB' }}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: secondaryTextColor }}>
                            {m.description}
                          </Text>
                          <Text style={{ fontSize: 11, color: secondaryTextColor + '99', marginTop: 2 }}>
                            {m.quantity} {m.unit} × {currency(m.price)}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: primaryColor }}>
                          {currency(m.subTotal)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ── Location details (if any) ── */}
            {(invoice.state || invoice.lga) && (
              <View
                style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
                className="rounded-2xl mx-1 mb-4 p-4"
              >
                <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
                  <Ionicons name="map-outline" size={16} color={primaryColor} />
                  <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                    LOCATION
                  </Text>
                </View>
                <View className="flex-row" style={{ gap: 16 }}>
                  {invoice.state && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: secondaryTextColor + '99' }}>State</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: secondaryTextColor, marginTop: 2 }}>
                        {invoice.state}
                      </Text>
                    </View>
                  )}
                  {invoice.lga && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: secondaryTextColor + '99' }}>LGA</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: secondaryTextColor, marginTop: 2 }}>
                        {invoice.lga}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* ── Payment CTA (sticky bottom) ── */}
          {invoice.payStatus === 'unpaid' && role === 'client' && (
            <View
              className="px-4 pb-4 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: borderColor }}
            >
              <ButtonComponent
                color={primaryColor}
                text={`Pay ${currency(grandTotal)}`}
                textcolor="#fff"
                onPress={() =>
                  router.push(
                    `/paymentLayout?jobId=${invoice.id}&materialCost=${invoice.materialsCost}&workmanship=${invoice.workmanship}`
                  )
                }
              />
            </View>
          )}
        </View>
      </ContainerTemplate>
    );
  };
  
  export default InvoiceViewScreen;
  
  /* ─── Helper components ──────────────────────────────────── */

  const MetaChip = ({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) => (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons name={icon} size={13} color={color + '99'} />
      <Text style={{ fontSize: 12, color: color + '99' }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  
  const CostRow = ({ label, amount, color }: { label: string; amount: number; color: string }) => (
    <View className="flex-row justify-between items-center py-2">
      <Text style={{ fontSize: 13, color: color + '99' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color }}>{currency(amount)}</Text>
    </View>
  );