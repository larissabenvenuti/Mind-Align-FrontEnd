"use client";

import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import type { Tag } from "../../../types";

import styles from "../Tasks.module.scss";

const PRESET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

interface TaskTagManagerProps {
  tags: Tag[];
  selectedTagIds: string[];
  newTagName: string;
  newTagColor: string;
  onToggleTag: (tagId: string) => void;
  onNewTagNameChange: (name: string) => void;
  onNewTagColorChange: (color: string) => void;
  onCreateTag: () => void;
  onDeleteTag: (tagId: string) => void;
}

export default function TaskTagManager({
  tags,
  selectedTagIds,
  newTagName,
  newTagColor,
  onToggleTag,
  onNewTagNameChange,
  onNewTagColorChange,
  onCreateTag,
  onDeleteTag,
}: TaskTagManagerProps) {
  return (
    <motion.div
      className={styles.tagManager}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className={styles.tagManagerSection}>
        <div className={styles.tagSectionHeading}>
          <div>
            <h3>Adicionar tags à tarefa</h3>
            <p>
              Selecione uma ou mais categorias para organizar esta tarefa.
            </p>
          </div>
          <span className={styles.selectionCount}>
            {selectedTagIds.length} selecionada
            {selectedTagIds.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className={styles.tagList}>
          {tags.length === 0 ? (
            <p className={styles.noTags}>Nenhuma tag criada ainda</p>
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tag.id)}
                  className={`${styles.tagOption} ${isSelected ? styles.tagOptionSelected : ""}`}
                  aria-pressed={isSelected}
                  title={`${isSelected ? "Remover" : "Adicionar"} tag ${tag.name}`}
                  style={{
                    borderColor: tag.color,
                    backgroundColor: isSelected ? `${tag.color}18` : "transparent",
                    color: isSelected ? tag.color : "inherit",
                  }}
                >
                  <span
                    className={styles.tagOptionDot}
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  {isSelected && (
                    <Check
                      className={styles.tagOptionCheck}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.tagManagerSection}>
        <h3>Criar nova tag</h3>
        <div className={styles.createTagForm}>
          <Input
            type="text"
            placeholder="Nome da tag"
            value={newTagName}
            onChange={(e) => onNewTagNameChange(e.target.value)}
            className={styles.tagInput}
          />

          <div className={styles.colorPickerContainer}>
            <div className={styles.colorPickerHeading}>
              <span>Cor da tag</span>
              <span
                className={styles.selectedColorPreview}
                style={{ backgroundColor: newTagColor }}
              />
            </div>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.colorSwatch} ${newTagColor === color ? styles.colorSwatchActive : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => onNewTagColorChange(color)}
                title={`Selecionar cor ${color}`}
                aria-label={`Selecionar cor ${color}`}
                aria-pressed={newTagColor === color}
              />
            ))}
          </div>

          <Button
            onClick={onCreateTag}
            disabled={!newTagName.trim()}
            className={styles.createTagBtn}
          >
            <Plus size={16} /> Criar
          </Button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className={styles.tagManagerSection}>
          <h3>Tags Existentes</h3>
          <div className={styles.existingTags}>
            {tags.map((tag) => (
              <div key={tag.id} className={styles.existingTag}>
                <span
                  className={styles.tagDot}
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
                <button
                  onClick={() => onDeleteTag(tag.id)}
                  className={styles.deleteTagBtn}
                  title="Excluir tag"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
