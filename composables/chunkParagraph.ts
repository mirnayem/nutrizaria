export const chunkParagraph = (paragraph: string, parts: number) => {
  // Split the paragraph into sentences using regex for punctuation
  const sentences = paragraph.match(/[^.!?]+[.!?]+/g);

  if (!sentences) return []; // Return empty if no sentences found

  const chunkSize = Math.ceil(sentences.length / parts); // Determine chunk size
  const chunks = [];

  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(
      sentences
        .slice(i, i + chunkSize)
        .join(" ")
        .trim()
    );
  }

  return chunks;
};
