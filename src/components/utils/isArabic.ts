export const isArabic = (text?: string) =>
  text ? /[\u0600-\u06FF\u0750-\u077F]/.test(text) : false;
