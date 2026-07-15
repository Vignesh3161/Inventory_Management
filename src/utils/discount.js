export const calculateDiscount = (price, discountPercentage) => {
  const discountAmount = (price * discountPercentage) / 100;
  return parseFloat(discountAmount.toFixed(2));
};
