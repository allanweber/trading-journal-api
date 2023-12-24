export const getOnlyDate = (date: Date) => {
  const dateTime = new Date(date);
  return new Date(
    dateTime.getFullYear(),
    dateTime.getMonth(),
    dateTime.getDate()
  );
};
