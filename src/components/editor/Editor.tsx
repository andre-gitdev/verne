'use client'
import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { supabase } from '@/lib/supabase'
import { Editor as TiptapEditor } from '@tiptap/react'

interface EditorProps {
  chapterId: string
  initialContent: object | null
  onWordCountChange: (words: number) => void
  onInitialWordCount: (words: number) => void
  onEditorReady: (editor: TiptapEditor) => void
  lineWidth: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function Editor({
  chapterId,
  initialContent,
  onWordCountChange,
  onInitialWordCount,
  onEditorReady,
  lineWidth,
}: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({ placeholder: 'Begin writing…' }),
      CharacterCount,
      TextStyle,
      FontFamily,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-screen py-16 px-8 [&_*]:text-stone-800 dark:[&_*]:text-stone-200 [&_p]:leading-8',
      },
    },
    onCreate: ({ editor }) => {
      const words = countWords(editor.getText())
      onInitialWordCount(words)
      onWordCountChange(words)
      onEditorReady(editor)
    },
    onUpdate: ({ editor }) => {
      const words = countWords(editor.getText())
      onWordCountChange(words)
      debouncedSave(editor.getJSON(), words)
    },
  })

  const debouncedSave = useRef(
    debounce(async (content: object, wordCount: number) => {
      await supabase
        .from('chapters')
        .update({
          content,
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapterId)
    }, 500)
  ).current

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  return (
    <div className={`${lineWidth} mx-auto`}>
      <EditorContent editor={editor} />
    </div>
  )
}