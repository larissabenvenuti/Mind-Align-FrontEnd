"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import { api } from "../../../lib/api";
import { toast } from "../../../lib/toast";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Label } from "../../../components/ui/Label/Label";

import styles from "../Settings.module.scss";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  theme?: string;
}

export default function ProfileSettings() {
  const { user, setAuthData } = useAuth();
  const [syncedUser, setSyncedUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState<string | null>(user?.image || null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.image || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (user && user !== syncedUser) {
    setSyncedUser(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setImage(user.image || null);
    setImagePreview(user.image || null);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Não foi possível ler a imagem selecionada.");
    };

    reader.onload = () => {
      const source = new Image();

      source.onerror = () => {
        toast.error("Não foi possível processar a imagem selecionada.");
      };

      source.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(
          1,
          maxDimension / Math.max(source.width, source.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(source.width * scale);
        canvas.height = Math.round(source.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          toast.error("Não foi possível processar a imagem selecionada.");
          return;
        }

        context.drawImage(source, 0, 0, canvas.width, canvas.height);

        const result = canvas.toDataURL("image/jpeg", 0.82);

        if (result.length > 5_000_000) {
          toast.error("A imagem processada excede o limite permitido.");
          return;
        }

        setImage(result);
        setImagePreview(result);
      };

      source.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Digite seu nome.");
      return;
    }

    if (!email.trim()) {
      toast.error("Digite seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const updatedData = await api.put<UserProfile>("/api/user/profile", {
        name: name.trim(),
        email: email.trim(),
        image,
      });

      if (!updatedData) {
        throw new Error("Sem resposta do servidor");
      }

      const token = localStorage.getItem("token");

      if (token) {
        setAuthData(updatedData, token);
      }

      setImage(updatedData.image);
      setImagePreview(updatedData.image);

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao atualizar perfil";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <form
      onSubmit={handleUpdateProfile}
      className={styles.formCard}
    >
      <h2 className={styles.cardTitle}>Dados do Perfil</h2>

      <div className={styles.avatarSection}>
        <div className={styles.profileAvatar}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={`Foto de ${name || "usuário"}`}
              className={styles.profileAvatarImage}
            />
          ) : (
            <span className={styles.profileAvatarLetter}>{avatarLetter}</span>
          )}

          <button
            type="button"
            className={styles.cameraButton}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Alterar foto"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className={styles.avatarInfo}>
          <h3>Foto de perfil</h3>
          <p>JPG, PNG ou WEBP. Máximo de 5MB.</p>

          <div className={styles.avatarActions}>
            <button
              type="button"
              className={styles.changePhotoButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Escolher foto
            </button>

            {imagePreview && (
              <button
                type="button"
                className={styles.removePhotoButton}
                onClick={handleRemoveImage}
              >
                <Trash2 size={15} />
                Remover
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className={styles.hiddenFileInput}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? "Salvando..." : "Salvar Perfil"}
      </Button>
    </form>
  );
}
