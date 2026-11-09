"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Strikethrough,
} from "lucide-react";
import styles from "./Editor.module.scss";

interface EditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
}

export function Editor({ content, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    editorProps: {
      attributes: {
        class: styles.proseMirror,
      },
    },
  });

  useEffect(() => {
    if (editor && content === "" && !editor.isDestroyed) {
      editor.commands.setContent("");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.active : ""}`}
          title="Negrito"
          whileTap={{ scale: 0.9 }}
        >
          <Bold className={styles.icon} />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.active : ""}`}
          title="Itálico"
          whileTap={{ scale: 0.9 }}
        >
          <Italic className={styles.icon} />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("underline") ? styles.active : ""}`}
          title="Sublinhado"
          whileTap={{ scale: 0.9 }}
        >
          <UnderlineIcon className={styles.icon} />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("strike") ? styles.active : ""}`}
          title="Riscado"
          whileTap={{ scale: 0.9 }}
        >
          <Strikethrough className={styles.icon} />
        </motion.button>

        <div className={styles.divider} />

        <motion.button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
          title="Título 1"
          whileTap={{ scale: 0.9 }}
        >
          <Heading1 className={styles.icon} />
        </motion.button>
        <motion.button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
          title="Título 2"
          whileTap={{ scale: 0.9 }}
        >
          <Heading2 className={styles.icon} />
        </motion.button>

        <div className={styles.divider} />

        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.active : ""}`}
          title="Lista"
          whileTap={{ scale: 0.9 }}
        >
          <List className={styles.icon} />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.active : ""}`}
          title="Lista Numerada"
          whileTap={{ scale: 0.9 }}
        >
          <ListOrdered className={styles.icon} />
        </motion.button>
      </div>

      <div
        className={styles.contentArea}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}