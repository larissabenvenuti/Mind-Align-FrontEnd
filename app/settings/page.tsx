"use client";

import { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Settings as SettingsIcon,
  Camera,
  Trash2,
} from "lucide-react";

import Link from "next/link";

import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import { Label } from "../../components/ui/Label/Label";
import { PasswordRequirement } from "../auth/components/PasswordRequirement/PasswordRequirement";

import styles from "./Settings.module.scss";

type TabType = "profile" | "security" | "notifications";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  theme?: string;
}

interface NotifPrefs {
  eventReminders: boolean;
  dailyTaskSummary: boolean;
  habitReminders: boolean;
  reminderMinutesBefore: number;
}

export default function SettingsPage() {
  const { user, setAuthData } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordRequirements = [
    { key: "length", text: "Mínimo de 8 caracteres", met: newPassword.length >= 8 },
    { key: "uppercase", text: "Uma letra maiúscula", met: /[A-Z]/.test(newPassword) },
    { key: "lowercase", text: "Uma letra minúscula", met: /[a-z]/.test(newPassword) },
    { key: "number", text: "Um número", met: /\d/.test(newPassword) },
    {
      key: "special",
      text: "Um caractere especial (!@#$%...)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    eventReminders: true,
    dailyTaskSummary: true,
    habitReminders: true,
    reminderMinutesBefore: 15,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setImage(user.image || null);
      setImagePreview(user.image || null);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "notifications") {
      loadNotificationPrefs();
    }
  }, [activeTab]);

  const loadNotificationPrefs = async () => {
    try {
      setLoading(true);

      const data = await api.get<NotifPrefs>(
        "/api/notifications/preferences"
      );

      setNotifPrefs({
        eventReminders: data.eventReminders,
        dailyTaskSummary: data.dailyTaskSummary,
        habitReminders: data.habitReminders,
        reminderMinutesBefore: data.reminderMinutesBefore,
      });
    } catch {
      toast.error("Erro ao carregar preferências de notificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;

      setImage(result);
      setImagePreview(result);
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

  const handleUpdateProfile = async (
    e: React.FormEvent
  ) => {
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
      const updatedData = await api.put<UserProfile>(
        "/api/user/profile",
        {
          name: name.trim(),
          email: email.trim(),
          image,
        }
      );

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
    } catch (err: any) {
      const msg =
        err?.message || "Erro ao atualizar perfil";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas novas não coincidem.");
      return;
    }

    if (passwordRequirements.some((requirement) => !requirement.met)) {
      toast.error(
        "A nova senha não atende a todos os requisitos."
      );
      return;
    }

    setLoading(true);

    try {
      await api.put("/api/user/password", {
        currentPassword,
        newPassword,
      });

      toast.success("Senha atualizada com sucesso!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err?.message || "Erro ao atualizar senha"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.put(
        "/api/notifications/preferences",
        notifPrefs
      );

      toast.success(
        "Preferências salvas com sucesso!"
      );
    } catch {
      toast.error(
        "Erro ao salvar preferências."
      );
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter =
    name.trim().charAt(0).toUpperCase() || "U";

  return (
    <motion.section
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="global-background-orbs">
        <motion.div className="global-orb-top" />
        <motion.div className="global-orb-bottom" />
      </div>

      <div className={styles.spacer} />

      <div className={styles.content}>
        <div className={styles.wrapper}>

          <header className={styles.header}>
            <Link href="/dashboard">
              <motion.div
                className={styles.backLink}
                whileHover={{ x: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <ArrowLeft className={styles.backIcon} />
                Voltar ao Dashboard
              </motion.div>
            </Link>

            <div className={styles.titleSection}>
              <motion.span className={styles.iconBox}>
                <SettingsIcon
                  className={styles.mainIcon}
                />
              </motion.span>

              <div>
                <h1 className={styles.title}>
                  Configurações
                </h1>

                <p className={styles.subtitle}>
                  Gerencie sua conta, segurança e
                  notificações.
                </p>
              </div>
            </div>
          </header>

          <div className={styles.settingsLayout}>

            <aside className={styles.tabsSidebar}>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "profile"
                    ? styles.tabActive
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("profile")
                }
              >
                <User className={styles.tabIcon} />
                Perfil
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "security"
                    ? styles.tabActive
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("security")
                }
              >
                <Lock className={styles.tabIcon} />
                Segurança
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "notifications"
                    ? styles.tabActive
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("notifications")
                }
              >
                <Bell className={styles.tabIcon} />
                Notificações
              </button>

            </aside>

            <main className={styles.tabContent}>

              <AnimatePresence mode="wait">

                {activeTab === "profile" && (
                  <motion.form
                    key="profile"
                    onSubmit={handleUpdateProfile}
                    className={styles.formCard}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <h2 className={styles.cardTitle}>
                      Dados do Perfil
                    </h2>

                    <div className={styles.avatarSection}>

                      <div className={styles.profileAvatar}>

                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt={`Foto de ${
                              name || "usuário"
                            }`}
                            className={
                              styles.profileAvatarImage
                            }
                          />
                        ) : (
                          <span
                            className={
                              styles.profileAvatarLetter
                            }
                          >
                            {avatarLetter}
                          </span>
                        )}

                        <button
                          type="button"
                          className={styles.cameraButton}
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          aria-label="Alterar foto"
                        >
                          <Camera
                            size={18}
                          />
                        </button>
                      </div>

                      <div className={styles.avatarInfo}>

                        <h3>
                          Foto de perfil
                        </h3>

                        <p>
                          JPG, PNG ou WEBP. Máximo de
                          5MB.
                        </p>

                        <div
                          className={
                            styles.avatarActions
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.changePhotoButton
                            }
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                          >
                            Escolher foto
                          </button>

                          {imagePreview && (
                            <button
                              type="button"
                              className={
                                styles.removePhotoButton
                              }
                              onClick={
                                handleRemoveImage
                              }
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
                          onChange={
                            handleImageChange
                          }
                          className={
                            styles.hiddenFileInput
                          }
                        />

                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <Label htmlFor="name">
                        Nome Completo
                      </Label>

                      <Input
                        id="name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <Label htmlFor="email">
                        E-mail
                      </Label>

                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={styles.submitBtn}
                    >
                      {loading
                        ? "Salvando..."
                        : "Salvar Perfil"}
                    </Button>

                  </motion.form>
                )}

                {activeTab === "security" && (
                  <motion.form
                    key="security"
                    onSubmit={
                      handleUpdatePassword
                    }
                    className={styles.formCard}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <h2
                      className={
                        styles.cardTitle
                      }
                    >
                      Alterar Senha
                    </h2>

                    <div
                      className={
                        styles.securityHint
                      }
                    >
                      Crie uma senha forte que atenda aos requisitos abaixo.
                    </div>

                    <div
                      className={
                        styles.inputGroup
                      }
                    >
                      <Label htmlFor="currentPassword">
                        Senha Atual
                      </Label>

                      <Input
                        id="currentPassword"
                        type="password"
                        value={
                          currentPassword
                        }
                        onChange={(e) =>
                          setCurrentPassword(
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div
                      className={
                        styles.inputGroup
                      }
                    >
                      <Label htmlFor="newPassword">
                        Nova Senha
                      </Label>

                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value
                          )
                        }
                        required
                      />
                      {newPassword && (
                        <div className={styles.passwordRequirements}>
                          <p className={styles.passwordRequirementsTitle}>
                            A senha precisa conter:
                          </p>
                          {passwordRequirements.map((requirement) => (
                            <PasswordRequirement
                              key={requirement.key}
                              met={requirement.met}
                              text={requirement.text}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        styles.inputGroup
                      }
                    >
                      <Label htmlFor="confirmPassword">
                        Confirmar Nova Senha
                      </Label>

                      <Input
                        id="confirmPassword"
                        type="password"
                        value={
                          confirmPassword
                        }
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={
                        styles.submitBtn
                      }
                    >
                      {loading
                        ? "Atualizando..."
                        : "Atualizar Senha"}
                    </Button>

                  </motion.form>
                )}

                {activeTab === "notifications" && (
                  <motion.form
                    key="notifications"
                    onSubmit={
                      handleUpdateNotifications
                    }
                    className={styles.formCard}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <h2
                      className={
                        styles.cardTitle
                      }
                    >
                      Preferências de
                      Notificações Push
                    </h2>

                    <div
                      className={
                        styles.toggleGroup
                      }
                    >
                      <Label
                        className={
                          styles.toggleLabel
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            notifPrefs.eventReminders
                          }
                          onChange={(e) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              eventReminders:
                                e.target.checked,
                            })
                          }
                          className={
                            styles.checkbox
                          }
                        />

                        <span>
                          Lembretes de Eventos do
                          Calendário
                        </span>
                      </Label>
                    </div>

                    <div
                      className={
                        styles.toggleGroup
                      }
                    >
                      <Label
                        className={
                          styles.toggleLabel
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            notifPrefs.habitReminders
                          }
                          onChange={(e) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              habitReminders:
                                e.target.checked,
                            })
                          }
                          className={
                            styles.checkbox
                          }
                        />

                        <span>
                          Lembretes de Hábitos
                          Diários
                        </span>
                      </Label>
                    </div>

                    <div
                      className={
                        styles.toggleGroup
                      }
                    >
                      <Label
                        className={
                          styles.toggleLabel
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            notifPrefs.dailyTaskSummary
                          }
                          onChange={(e) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              dailyTaskSummary:
                                e.target.checked,
                            })
                          }
                          className={
                            styles.checkbox
                          }
                        />

                        <span>
                          Resumo Diário de Tarefas
                        </span>
                      </Label>
                    </div>

                    <div
                      className={styles.inputGroup}
                      style={{
                        marginTop: "1rem",
                      }}
                    >
                      <Label htmlFor="remindBefore">
                        Tempo Padrão de Lembrete
                        (Eventos)
                      </Label>

                      <select
                        id="remindBefore"
                        value={
                          notifPrefs.reminderMinutesBefore
                        }
                        onChange={(e) =>
                          setNotifPrefs({
                            ...notifPrefs,
                            reminderMinutesBefore:
                              Number(
                                e.target.value
                              ),
                          })
                        }
                        className={
                          styles.select
                        }
                      >
                        <option value={5}>
                          5 minutos antes
                        </option>

                        <option value={15}>
                          15 minutos antes
                        </option>

                        <option value={30}>
                          30 minutos antes
                        </option>

                        <option value={60}>
                          1 hora antes
                        </option>

                        <option value={1440}>
                          1 dia antes
                        </option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={
                        styles.submitBtn
                      }
                    >
                      {loading
                        ? "Salvando..."
                        : "Salvar Preferências"}
                    </Button>

                  </motion.form>
                )}

              </AnimatePresence>

            </main>
          </div>
        </div>
      </div>
    </motion.section>
  );
}