export const useTruncate = (
  text: string,
  wordLimit: number = 20,
  readMore: boolean = false
): string => {
  const wordsArray = text.trim().split(/\s+/);

  if (wordsArray.length <= wordLimit) {
    return text;
  }

  const truncatedText = wordsArray.slice(0, wordLimit).join(" ");

  return readMore
    ? `${truncatedText} <span class='text-violet-800 text-lg font-normal'>.....</span>`
    : `${truncatedText}...`;
};
