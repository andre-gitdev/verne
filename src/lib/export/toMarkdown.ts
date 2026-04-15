interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
}

function nodeToMarkdown(node: TiptapNode): string {
  if (node.type === 'text') {
    let text = node.text || ''
    if (node.marks?.some(m => m.type === 'bold')) text = `**${text}**`
    if (node.marks?.some(m => m.type === 'italic')) text = `_${text}_`
    if (node.marks?.some(m => m.type === 'code')) text = `\`${text}\``
    return text
  }
  if (node.type === 'paragraph') {
    return (node.content || []).map(nodeToMarkdown).join('') + '\n\n'
  }
  if (node.type === 'heading') {
    const text = (node.content || []).map(nodeToMarkdown).join('')
    return `# ${text}\n\n`
  }
  if (node.type === 'bulletList') {
    return (node.content || []).map(item =>
      `- ${(item.content || []).flatMap(c => (c.content || []).map(nodeToMarkdown)).join('')}`
    ).join('\n') + '\n\n'
  }
  if (node.type === 'orderedList') {
    return (node.content || []).map((item, i) =>
      `${i + 1}. ${(item.content || []).flatMap(c => (c.content || []).map(nodeToMarkdown)).join('')}`
    ).join('\n') + '\n\n'
  }
  if (node.type === 'blockquote') {
    return (node.content || []).map(c => `> ${nodeToMarkdown(c)}`).join('') + '\n'
  }
  if (node.type === 'horizontalRule') return '---\n\n'
  if (node.type === 'hardBreak') return '\n'
  return (node.content || []).map(nodeToMarkdown).join('')
}

export function exportToMarkdown(content: TiptapNode, title: string) {
  const markdown = `# ${title}\n\n` + (content.content || []).map(nodeToMarkdown).join('')
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToPlainText(content: TiptapNode, title: string) {
  const text = (content.content || []).map(nodeToMarkdown).join('').replace(/[#*_`>-]/g, '').trim()
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.txt`
  a.click()
  URL.revokeObjectURL(url)
}