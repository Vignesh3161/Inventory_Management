export const calculateGST = (price, gstPercentage) => {
  const gstAmount = (price * gstPercentage) / 100;
  return parseFloat(gstAmount.toFixed(2));
};
