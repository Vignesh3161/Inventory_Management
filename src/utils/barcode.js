export const generateUniqueBarcode = () => {
  // Generate a random 13 digit number starting with 890 (India country code)
  let barcode = '890';
  for (let i = 0; i < 9; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  // Simple checksum digit calculation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return barcode + checksum;
};
