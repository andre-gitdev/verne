import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
}

function parseNode(node: TiptapNode): Paragraph[] {
  if (node.type === 'paragraph') {
    const runs = (node.content || []).map(child => {
      const bold = child.marks?.some(m => m.type === 'bold')
      const italic = child.marks?.some(m => m.type === 'italic')
      return new TextRun({ text: child.text || '', bold, italics: italic })
    })
    return [new Paragraph({ children: runs.length ? runs : [new TextRun('')] })]
  }
  if (node.type === 'heading') {
    const text = (node.content || []).map(c => c.text || '').join('')
    return [new Paragraph({ text, heading: HeadingLevel.HEADING_1 })]
  }
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content || []).flatMap(item =>
      (item.content || []).flatMap(child => parseNode(child))
    )
  }
  if (node.type === 'blockquote') {
    return (node.content || []).flatMap(child => parseNode(child))
  }
  return []
}

export async function exportToDocx(content: TiptapNode, title: string) {
  const children = (content.content || []).flatMap(node => parseNode(node))
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
        ...children,
      ],
    }],
  })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.docx`
  a.click()
  URL.revokeObjectURL(url)
}