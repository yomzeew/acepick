export const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };
export const formatAmount=(amount:number)=>{
    return amount.toLocaleString('en-NG')
}