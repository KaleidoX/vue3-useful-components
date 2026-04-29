import mammoth_ from 'mammoth'

export async function convertDocxToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth_.convertToHtml({ arrayBuffer })
  return result.value
}

export async function convertDocxToMarkdown(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth_.convertToMarkdown({ arrayBuffer })
  return result.value
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth_.extractRawText({ arrayBuffer })
  return result.value
}
