import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export async function generateDocx(text: string, filename = 'document.docx') {
  const doc = new Document({
    sections: [{
      properties: {},
      children: text.split('\n').map(line =>
        new Paragraph({ children: [new TextRun(line)] })
      )
    }]
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
