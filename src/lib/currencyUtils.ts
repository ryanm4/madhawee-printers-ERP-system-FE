
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

export const formatCurrency = (amount: number | string, currency?: Currency): string => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "0.00";

    const formattedValue = numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });

    if (currency) {
        return `${getCurrencySymbol(currency)} ${formattedValue}`;
    }

    return formattedValue;
};
