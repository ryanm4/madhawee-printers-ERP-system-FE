
export type Currency = "LKR" | "USD" | "EUR" | "GBP";

export const getCurrencySymbol = (currency: Currency): string => {
    const symbols: Record<Currency, string> = {
        LKR: "Rs",
        USD: "$",
        EUR: "€",
        GBP: "£",
    };
    return symbols[currency] || "Rs";
};

export const formatCurrency = (amount: number | string, currency: Currency = "LKR"): string => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "0.00";

    return numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
