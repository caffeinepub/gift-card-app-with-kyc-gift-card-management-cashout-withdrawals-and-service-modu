export const CONVERSION_CONFIG = {
  rate: 0.85, // 85% of face value
  fee: 0.05, // 5% processing fee
};

export interface ConversionOverrides {
  rate?: number;
  fee?: number;
}

export function calculateConversion(amount: number, overrides?: ConversionOverrides) {
  const effectiveRate = overrides?.rate ?? CONVERSION_CONFIG.rate;
  const effectiveFee = overrides?.fee ?? CONVERSION_CONFIG.fee;
  
  const gross = amount * effectiveRate;
  const fee = gross * effectiveFee;
  const net = gross - fee;
  
  return {
    gross,
    fee,
    net,
    rate: effectiveRate,
    feeRate: effectiveFee,
  };
}
