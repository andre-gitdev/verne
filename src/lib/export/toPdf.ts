import jsPDF from 'jspdf'

interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
}

function extractText(node: TiptapNode): string {
  if (node.type === 'text') return node.text || ''
  return (node.content || []).map(extractText).join('')
}

export function exportToPdf(content: TiptapNode, title: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let y = margin

  doc.setFont('times', 'bold')
  doc.setFontSize(18)
  doc.text(title, margin, y)
  y += 12

  doc.setFont('times', 'normal')
  doc.setFontSize(12)

  for (const node of content.content || []) {
    if (y > 270) { doc.addPage(); y = margin }

    if (node.type === 'heading') {
      doc.setFont('times', 'bold')
      doc.setFontSize(14)
      const text = extractText(node)
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, margin, y)
      y += lines.length * 7 + 4
      doc.setFont('times', 'normal')
      doc.setFontSize(12)
    } else if (node.type === 'paragraph') {
      const text = extractText(node)
      if (!text.trim()) { y += 4; continue }
      const lines = doc.splitTextToSize(text, maxWidth)
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = margin }
        doc.text(line, margin, y)
        y += 6
      }
      y += 3
    } else if (node.type === 'horizontalRule') {
      doc.setDrawColor(180)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6
    }
  }

  doc.save(`${title}.pdf`)
}