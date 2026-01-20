export const toMySQLDateTime = (date: Date) => {
    return date.toISOString().slice(0, 10);;
};
