import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, TextInput } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import SliderModalTemplate from "component/slideupModalTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import ButtonFunction from "component/buttonfunction"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { fetchTransactionsAsync, setTransactionFilters, clearTransactionFilters, fetchTransactionStatsAsync } from "redux/slices/walletSlice"
import { transactionService } from "services/transactionService"
import { TransactionFilters } from "services/transactionService"

const BillingHistory = () => {
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const [value,setValue]=useState<string>('All')
    const [statusValue, setStatusValue] = useState<string>('All')
    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, backgroundColor, backgroundColortwo, successColor, errorColor } = getColors(theme)
    
    // Redux state
    const dispatch = useDispatch()
    const { transactions, isLoading, transactionFilters, transactionStats } = useSelector((state: RootState) => state.wallet)
    
    const transactionTypes = ['All', 'Job Payments', 'Product Purchases', 'Wallet Topups', 'Withdrawals']
    const statusOptions = ['All', 'Success', 'Failed', 'Pending']

    // Fetch transactions on component mount
    useEffect(() => {
        dispatch(fetchTransactionsAsync(transactionFilters) as any)
        dispatch(fetchTransactionStatsAsync() as any)
    }, [])

    // Apply filters
    const applyFilters = () => {
        const filters: TransactionFilters = {
            ...transactionFilters,
            search: searchQuery || undefined,
            type: value === 'All' ? undefined : value.toLowerCase().includes('credit') ? 'credit' : 'debit',
            status: statusValue === 'All' ? undefined : statusValue.toLowerCase() as any,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
        }
        dispatch(setTransactionFilters(filters))
        dispatch(fetchTransactionsAsync(filters) as any)
        setshowmodal(false)
    }

    // Refresh transactions
    const onRefresh = () => {
        setRefreshing(true)
        dispatch(fetchTransactionsAsync(transactionFilters) as any)
        dispatch(fetchTransactionStatsAsync() as any)
        setRefreshing(false)
    }

    // Clear filters
    const clearFilters = () => {
        setFromDate('')
        setToDate('')
        setValue('All')
        setStatusValue('All')
        setSearchQuery('')
        setErrors({})
        dispatch(clearTransactionFilters())
        dispatch(fetchTransactionsAsync() as any)
    }

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query)
        const filters = {
            ...transactionFilters,
            search: query || undefined,
        }
        dispatch(setTransactionFilters(filters))
        dispatch(fetchTransactionsAsync(filters) as any)
    }
    return (
        <>
            <SliderModalTemplate showmodal={showmodal} setshowmodal={setshowmodal} modalHeight={'85%'}>
                <View className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
                        <Text style={{ fontSize: 15, fontWeight: '700', color: secondaryTextColor }}>Filter Transactions</Text>
                        <TouchableOpacity onPress={() => setshowmodal(false)}>
                            <Feather name="x" size={20} color={secondaryTextColor} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                        {/* Quick Date Presets */}
                        <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3 mb-3">
                            <View className="flex-row items-center mb-2">
                                <Feather name="calendar" size={14} color={primaryColor} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: secondaryTextColor, marginLeft: 6 }}>Quick Date Range</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month'].map((preset) => (
                                    <TouchableOpacity
                                        key={preset}
                                        onPress={() => {
                                            const today = new Date();
                                            let from = '', to = '';
                                            if (preset === 'Today') {
                                                from = to = today.toISOString().split('T')[0];
                                            } else if (preset === 'Yesterday') {
                                                const yesterday = new Date(today);
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                from = to = yesterday.toISOString().split('T')[0];
                                            } else if (preset === 'This Week') {
                                                const weekStart = new Date(today);
                                                weekStart.setDate(today.getDate() - today.getDay());
                                                from = weekStart.toISOString().split('T')[0];
                                                to = today.toISOString().split('T')[0];
                                            } else if (preset === 'This Month') {
                                                from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                                                to = today.toISOString().split('T')[0];
                                            } else if (preset === 'Last Month') {
                                                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                                from = lastMonth.toISOString().split('T')[0];
                                                to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                                            }
                                            setFromDate(from);
                                            setToDate(to);
                                        }}
                                        style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '30', borderWidth: 1 }}
                                        className="px-3 py-1.5 rounded-lg"
                                    >
                                        <Text style={{ color: primaryColor, fontSize: 10, fontWeight: '600' }}>{preset}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Custom Date Range - lightweight TextInputs */}
                        <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3 mb-3">
                            <View className="flex-row items-center mb-2">
                                <Feather name="edit-3" size={14} color={primaryColor} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: secondaryTextColor, marginLeft: 6 }}>Custom Date Range</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text style={{ fontSize: 10, color: secondaryTextColor, marginBottom: 4 }}>From (YYYY-MM-DD)</Text>
                                    <View style={{ borderColor: borderColor, borderWidth: 1, backgroundColor: backgroundColor }} className="h-10 rounded-lg flex-row items-center px-3">
                                        <Feather name="calendar" size={12} color={secondaryTextColor} />
                                        <TextInput
                                            placeholder="2025-01-01"
                                            placeholderTextColor={secondaryTextColor + '50'}
                                            style={{ flex: 1, fontSize: 11, color: secondaryTextColor, marginLeft: 6, padding: 0 }}
                                            value={fromDate}
                                            onChangeText={(text) => { setFromDate(text); setErrors(prev => ({ ...prev, fromDate: '' })); }}
                                            maxLength={10}
                                            keyboardType="numbers-and-punctuation"
                                        />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <Text style={{ fontSize: 10, color: secondaryTextColor, marginBottom: 4 }}>To (YYYY-MM-DD)</Text>
                                    <View style={{ borderColor: borderColor, borderWidth: 1, backgroundColor: backgroundColor }} className="h-10 rounded-lg flex-row items-center px-3">
                                        <Feather name="calendar" size={12} color={secondaryTextColor} />
                                        <TextInput
                                            placeholder="2025-12-31"
                                            placeholderTextColor={secondaryTextColor + '50'}
                                            style={{ flex: 1, fontSize: 11, color: secondaryTextColor, marginLeft: 6, padding: 0 }}
                                            value={toDate}
                                            onChangeText={(text) => { setToDate(text); setErrors(prev => ({ ...prev, toDate: '' })); }}
                                            maxLength={10}
                                            keyboardType="numbers-and-punctuation"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Transaction Type */}
                        <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3 mb-3">
                            <View className="flex-row items-center mb-2">
                                <Feather name="layers" size={14} color={primaryColor} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: secondaryTextColor, marginLeft: 6 }}>Transaction Type</Text>
                            </View>
                            <SelectComponent setValue={(text)=>setValue(text)} value={value} width={'100%'} title="Select transaction type" data={transactionTypes}/>
                        </View>

                        {/* Status */}
                        <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3 mb-3">
                            <View className="flex-row items-center mb-2">
                                <Feather name="check-circle" size={14} color={primaryColor} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: secondaryTextColor, marginLeft: 6 }}>Status</Text>
                            </View>
                            <SelectComponent setValue={(text)=>setStatusValue(text)} value={statusValue} width={'100%'} title="Select status" data={statusOptions}/>
                        </View>

                        {/* Active Filters Count */}
                        {(fromDate || toDate || value !== 'All' || statusValue !== 'All') && (
                            <View className="mb-3">
                                <View style={{ backgroundColor: primaryColor + '15' }} className="rounded-lg p-2.5 flex-row items-center">
                                    <Feather name="filter" size={12} color={primaryColor} />
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: primaryColor, marginLeft: 6 }}>
                                        {[fromDate && 1, value !== 'All' && 1, statusValue !== 'All' && 1].filter(Boolean).length} active filter{[fromDate && 1, value !== 'All' && 1, statusValue !== 'All' && 1].filter(Boolean).length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View className="flex-row gap-3 pb-5">
                            <ButtonFunction 
                                textcolor="#ffffff" 
                                onPress={applyFilters}  
                                color={primaryColor} 
                                text="Apply Filters" 
                            />
                            <ButtonFunction 
                                textcolor={primaryColor} 
                                onPress={clearFilters}  
                                color="transparent"
                                text="Clear All" 
                            />
                        </View>
                    </ScrollView>
                </View>
            </SliderModalTemplate>

            <ContainerTemplate>
                <HeaderComponent title="Billing History" />
                <EmptyView height={15} />
                
                {/* Stats Cards */}
                <View className="px-3 mb-5">
                    <View className="flex-row gap-3">
                        <View style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '30', borderWidth: 1 }} className="flex-1 rounded-2xl p-3">
                            <View className="flex-row items-center mb-1">
                                <View style={{ backgroundColor: primaryColor }} className="w-6 h-6 rounded-full items-center justify-center mr-2">
                                    <FontAwesome5 name="arrow-down" size={10} color="#ffffff" />
                                </View>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Credits</ThemeTextsecond>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: primaryColor }}>
                                ₦{(transactionStats?.totalCredits || 0).toLocaleString()}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: backgroundColortwo + '15', borderColor: backgroundColortwo + '30', borderWidth: 1 }} className="flex-1 rounded-2xl p-3">
                            <View className="flex-row items-center mb-1">
                                <View style={{ backgroundColor: backgroundColortwo }} className="w-6 h-6 rounded-full items-center justify-center mr-2">
                                    <FontAwesome5 name="arrow-up" size={10} color="#ffffff" />
                                </View>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Debits</ThemeTextsecond>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: backgroundColortwo }}>
                                ₦{(transactionStats?.totalDebits || 0).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row gap-3 mt-3">
                        <View style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '30', borderWidth: 1 }} className="flex-1 rounded-2xl p-3">
                            <View className="flex-row items-center mb-1">
                                <View style={{ backgroundColor: primaryColor }} className="w-6 h-6 rounded-full items-center justify-center mr-2">
                                    <FontAwesome5 name="exchange" size={10} color="#ffffff" />
                                </View>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Total</ThemeTextsecond>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: primaryColor }}>
                                {(transactionStats?.totalTransactions || 0)}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: backgroundColortwo + '15', borderColor: backgroundColortwo + '30', borderWidth: 1 }} className="flex-1 rounded-2xl p-3">
                            <View className="flex-row items-center mb-1">
                                <View style={{ backgroundColor: backgroundColortwo }} className="w-6 h-6 rounded-full items-center justify-center mr-2">
                                    <FontAwesome5 name="clock" size={10} color="#ffffff" />
                                </View>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Pending</ThemeTextsecond>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: backgroundColortwo }}>
                                {transactionStats?.pendingTransactions || 0}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Search and Filter */}
                <View className="px-3 mb-4">
                    <View className="flex-row gap-3">
                        <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="flex-1 h-12 rounded-xl flex-row items-center px-4">
                            <Feather name="search" size={18} color={secondaryTextColor} />
                            <TextInput
                                placeholder="Search transactions..."
                                placeholderTextColor={secondaryTextColor}
                                style={{ flex: 1, color: secondaryTextColor, marginLeft: 8 }}
                                className="text-base"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>
                        <TouchableOpacity onPress={()=>setshowmodal(true)} style={{ backgroundColor: primaryColor }} className="h-12 w-12 rounded-xl flex-row items-center justify-center">
                            <Feather name="filter" size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transactions List */}
                <View className="px-3 flex-1">
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id.toString()}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
                        renderItem={({ item }) => {
                            const formattedTransaction = transactionService.formatTransactionDisplay(item)
                            return (
                                <TransactionCard 
                                    transaction={formattedTransaction}
                                    primaryColor={primaryColor}
                                    secondaryTextColor={secondaryTextColor}
                                    selectioncardColor={selectioncardColor}
                                    backgroundColortwo={backgroundColortwo}
                                />
                            )
                        }}
                        ListEmptyComponent={() => (
                            <View className="flex-1 items-center justify-center py-20">
                                <View style={{ backgroundColor: primaryColor + '10' }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="receipt-long" size={36} color={primaryColor} />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: secondaryTextColor }} className="text-center">
                                    No transactions found
                                </Text>
                                <Text style={{ fontSize: 13, color: secondaryTextColor, opacity: 0.7 }} className="mt-2 text-center px-8">
                                    {searchQuery || fromDate || toDate || value !== 'All' 
                                        ? 'Try adjusting your filters or search query' 
                                        : 'Your transaction history will appear here'}
                                </Text>
                                {(searchQuery || fromDate || toDate || value !== 'All') && (
                                    <TouchableOpacity onPress={clearFilters} className="mt-4">
                                        <Text style={{ color: primaryColor, fontSize: 13, fontWeight: '600' }}>Clear Filters</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </View>
            </ContainerTemplate>
        </>
    )
}

// Transaction Card Component
interface TransactionCardProps {
    transaction: {
        title: string;
        subtitle: string;
        amount: string;
        type: 'credit' | 'debit';
        status: 'success' | 'failed' | 'pending';
        date: string;
        icon: string;
        color: string;
    };
    primaryColor: string;
    secondaryTextColor: string;
    selectioncardColor: string;
    backgroundColortwo: string;
}

const TransactionCard = ({ transaction, primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo }: TransactionCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return primaryColor;
            case 'failed': return backgroundColortwo;
            case 'pending': return backgroundColortwo;
            default: return backgroundColortwo;
        }
    };

    const getAmountColor = (type: string) => {
        return type === 'credit' ? primaryColor : backgroundColortwo;
    };

    const getAmountPrefix = (type: string) => {
        return type === 'credit' ? '+' : '-';
    };

    return (
        <View style={{ backgroundColor: selectioncardColor, borderColor: selectioncardColor, borderWidth: 1 }} className="w-full rounded-2xl p-4 mb-3">
            <View className="flex-row items-start justify-between">
                {/* Left: Icon + Content */}
                <View className="flex-row items-start flex-1 mr-3">
                    <View style={{ backgroundColor: transaction.color + '15' }} className="w-12 h-12 rounded-xl items-center justify-center mr-3">
                        <FontAwesome5 name={transaction.icon as any} size={18} color={transaction.color} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ fontSize: 14, fontWeight: '600', color: secondaryTextColor }} numberOfLines={1}>
                            {transaction.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: secondaryTextColor, opacity: 0.7, marginTop: 2 }} numberOfLines={1}>
                            {transaction.subtitle}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View style={{ 
                                backgroundColor: getStatusColor(transaction.status) + '15', 
                                paddingHorizontal: 6, 
                                paddingVertical: 2, 
                                borderRadius: 12 
                            }}>
                                <Text style={{ 
                                    fontSize: 10, 
                                    fontWeight: '600', 
                                    color: getStatusColor(transaction.status),
                                    textTransform: 'uppercase'
                                }}>
                                    {transaction.status}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 11, color: secondaryTextColor, opacity: 0.6, marginLeft: 8 }}>
                                {transaction.date}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right: Amount */}
                <View className="items-end">
                    <Text style={{ fontSize: 15, fontWeight: '700', color: getAmountColor(transaction.type) }}>
                        {getAmountPrefix(transaction.type)}₦{Number(transaction.amount).toLocaleString()}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <FontAwesome5 
                            name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
                            size={10} 
                            color={getAmountColor(transaction.type)} 
                        />
                    </View>
                </View>
            </View>
        </View>
    )
};

export default BillingHistory