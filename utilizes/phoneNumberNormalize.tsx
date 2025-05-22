export const normalizePhone = (number: string) => {
    if (number.startsWith("0") && number.length === 11) {
      return "+234" + number.slice(1);
    }
    return number;
  };