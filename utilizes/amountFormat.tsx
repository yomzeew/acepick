export const formatNaira = (amount: number) => {
    return amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });
  }
  export const formatAmount = (amount: number) => {
    return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

