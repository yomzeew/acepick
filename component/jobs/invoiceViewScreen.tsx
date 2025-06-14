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
  import {
    FontAwesome,
    FontAwesome6,
  } from '@expo/vector-icons';
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import EmptyView from 'component/emptyview';
  import Divider from 'component/divider';
  import HeaderComponent from 'component/headerComp';
  import ButtonFunction from 'component/buttonfunction';
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import React, { useState } from 'react';
import { fetchInvoice } from 'services/userService';
import SliderModalTemplate from 'component/slideupModalTemplate';
import { Material } from 'type';

import store from 'redux/store';
  
  const currency = (n: number | null | undefined) =>
    `₦${(n ?? 0).toLocaleString()}`;
  
  const InvoiceViewScreen = () => {
    const params = useLocalSearchParams();
     const jobId = params.jobId as string;
    const role: string = store.getState().auth.user?.role || 'client'; // get token inside function
    const router = useRouter();
    const { theme } = useTheme();
    const {
      primaryColor,
      secondaryTextColor,
      selectioncardColor,
      backgroundColortwo,
    } = getColors(theme);
  
    const [showMat, setShowMat] = useState(false);
  
    //----------------------------------------------------------------
    // Fetch invoice
    //----------------------------------------------------------------
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
            <View className='w-full h-full justify-center items-center'>
            <ActivityIndicator color={primaryColor} style={{ marginTop: 30 }} />

            </View>
         
        </ContainerTemplate>
      );
    }
    if (!invoice || error) {
      return (
        <ContainerTemplate>
              <HeaderComponent title="View Invoice" />
              <EmptyView height={10} />
              <View className='px-3'>
              <ThemeTextsecond size={Textstyles.text_cmedium}>
            {error ? 'Failed to load invoice.' : 'Invoice not found.'}
          </ThemeTextsecond>

              </View>
       
        </ContainerTemplate>
      );
    }
  
    //----------------------------------------------------------------
    // Derived totals
    //----------------------------------------------------------------
    const materialsTotal = invoice.materials.reduce(
      (acc, m) => acc + m.subTotal,
      0
    );
    const workmanship    = invoice.workmanship ?? 0;
    const grandTotal     = materialsTotal + workmanship;
  
    //----------------------------------------------------------------
    // UI
    //----------------------------------------------------------------
    return (
      <>
        <ContainerTemplate>
          <View className="flex-1">
            <HeaderComponent title="View Invoice" />
            <EmptyView height={10} />
  
            {/* Edit button */}
            {role==='professional' &&<View className="items-end px-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/editinvoiceLayout?invoiceId=${invoice.id}`)
                }
                className="flex-row items-center gap-x-2"
              >
                <ThemeText size={Textstyles.text_cmedium}>Edit</ThemeText>
                <FontAwesome
                  size={18}
                  color={primaryColor}
                  name="pencil"
                />
              </TouchableOpacity>
            </View>}
  
            {/* Invoice body */}
            <View
              style={{ borderColor: primaryColor }}
              className="flex-1 border border-dashed m-3 p-4"
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Label label="Job title"   value={invoice.title} />
                <Label label="Description" value={invoice.description} />
                <Label label="Mode"        value={invoice.mode} />
                <Label
                  label="Address"
                  value={invoice.fullAddress ?? '-'}
                />
                <Label
                  label="State"
                  value={invoice.state ?? '-'}
                  inline
                />
                <Label
                  label="LGA"
                  value={invoice.lga ?? '-'}
                  inline
                />
  
                <Label
                  label="Duration"
                  value={
                    invoice.durationValue
                      ? `${invoice.durationValue} ${invoice.durationUnit}`
                      : '-'
                  }
                />
  
                <Divider />
                <EmptyView height={10} />
  
                <Label
                  label="Workmanship"
                  value={currency(workmanship)}
                />
                <Label
                  label="Materials total"
                  value={currency(materialsTotal)}
                />
                <Divider />
                <EmptyView height={10} />
  
                <View className="items-end">
                  <ThemeText size={Textstyles.text_medium}>
                    Grand Total: {currency(grandTotal)}
                  </ThemeText>
                </View>

                {role==='professional' &&<View className="items-end  ">
                    {invoice.payStatus==='unpaid'?<View className='bg-orange-300 rounded-2xl px-3'>
                    <Text className='text-orange-800' style={[Textstyles.text_xxmedium]}>
                    Payment Status: {invoice.payStatus}
                  </Text>

                    </View>:
                    <View className='bg-green-300 rounded-2xl px-3'>
                    <Text className='text-green-800' style={[Textstyles.text_xxmedium]}>
                    Payment Status: {invoice.payStatus}
                  </Text>

                    </View>}
                 
                </View>}
  
                <EmptyView height={10} />
                <ButtonFunction
                  color={primaryColor}
                  text="Show Materials"
                  textcolor="#fff"
                  onPress={() => setShowMat(true)}
                />
              </ScrollView>
            </View>
  
            {/* Payment button only if unpaid */}
            {invoice.payStatus === 'unpaid' && role==='client'&&(
              <View className="mx-3 mb-5">
                <ButtonFunction
                  color={primaryColor}
                  text="Proceed to Payment"
                  textcolor="#fff"
                  onPress={() =>
                    router.push(`/paymentLayout?jobId=${invoice.id}&materialCost=${invoice.materialsCost}&workmanship=${invoice.workmanship}`)
                  }
                />
              </View>
            )}
          </View>
        </ContainerTemplate>
  
        {/* ───────────────────────────────── Materials modal */}
        {showMat && (
          <SliderModalTemplate
            modalHeight="80%"
            showmodal={showMat}
            setshowmodal={setShowMat}
          >
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {invoice.materials.map((m) => (
                <MaterialCard
                  key={m.id}
                  item={m}
                  color={selectioncardColor}
                />
              ))}
              {invoice.materials.length === 0 && (
                <ThemeTextsecond size={Textstyles.text_small}>
                  No materials.
                </ThemeTextsecond>
              )}
              <EmptyView height={20} />
              <ButtonFunction
                color={primaryColor}
                text="Close"
                textcolor="#fff"
                onPress={() => setShowMat(false)}
              />
            </ScrollView>
          </SliderModalTemplate>
        )}
      </>
    );
  };
  
  export default InvoiceViewScreen;
  
  //------------------------------------------------------------------//
  // Re-usable bits
  //------------------------------------------------------------------//
  const Label = ({
    label,
    value,
    inline = false,
  }: {
    label: string;
    value: string;
    inline?: boolean;
  }) => (
    <>
      <View
        className={`${
          inline ? 'flex-row justify-between' : 'mb-2'
        }`}
      >
        <ThemeTextsecond size={Textstyles.text_xsmall}>
          {label}:
        </ThemeTextsecond>
        <ThemeText size={Textstyles.text_xsmall}>
          {value}
        </ThemeText>
      </View>
      {!inline && (
        <>
          <EmptyView height={10} />
          <Divider />
          <EmptyView height={10} />
        </>
      )}
    </>
  );
  
  const MaterialCard = ({
    item,
    color,
  }: {
    item: Material;
    color: string;
  }) => {
    return (
      <View
        style={{ backgroundColor: color, elevation: 4 }}
        className="rounded-xl px-3 py-3 mb-3 flex-row justify-between"
      >
        <View style={{ flexShrink: 1, paddingRight: 6 }}>
          <ThemeText size={Textstyles.text_small}>
            {item.description}
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            Qty: {item.quantity} {item.unit} · Price:{' '}
            {currency(item.price)}
          </ThemeTextsecond>
        </View>
        <ThemeText size={Textstyles.text_small}>
          {currency(item.subTotal)}
        </ThemeText>
      </View>
    );
  };