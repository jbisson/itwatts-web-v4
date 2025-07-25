function round(number, decimal) {
  const factorOfTen = Math.pow(10, decimal);
  return number !== 0 ? Math.round(number * factorOfTen) / factorOfTen : 0;
}

export { round }