import mammoth_ from 'mammoth'
import TurndownService from 'turndown'

const turndownService = new TurndownService()

export async function convertDocxToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth_.convertToHtml({ arrayBuffer })
  return result.value
}

export async function convertDocxToMarkdown(file: File): Promise<string> {
  const html = await convertDocxToHtml(file)
  const markdown = turndownService.turndown(html)
  return markdown
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth_.extractRawText({ arrayBuffer })
  return result.value
}
