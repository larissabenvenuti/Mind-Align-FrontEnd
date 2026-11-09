"use client";

import { useState, useEffect } from "react";
import { toast } from "../lib/toast";
import { api } from "../lib/api";

type NotificationSetup = {
  registration: ServiceWorkerRegistration;
  applicationServerKey: Uint8Array<ArrayBuffer>;
};

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;
let notificationSetupPromise: Promise<NotificationSetup> | null = null;

function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getServiceWorkerRegistration() {
  if (!registrationPromise) {
    registrationPromise = (async () => {
      await navigator.serviceWorker.register("/sw.js");
      return navigator.serviceWorker.ready;
    })().catch((error: unknown) => {
      registrationPromise = null;
      throw error;
    });
  }

  return registrationPromise;
}

function prepareNotificationSetup() {
  if (!notificationSetupPromise) {
    notificationSetupPromise = (async () => {
      const [registration, { publicKey }] = await Promise.all([
        getServiceWorkerRegistration(),
        api.get<{ publicKey: string }>("/api/notifications/vapid-public-key"),
      ]);

      if (!publicKey) {
        throw new Error("A chave de notificações não está configurada no servidor.");
      }

      return {
        registration,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      };
    })().catch((error: unknown) => {
      notificationSetupPromise = null;
      throw error;
    });
  }

  return notificationSetupPromise;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAndSync() {
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        try {
          const registration = await getServiceWorkerRegistration();
          const subscription = await registration.pushManager.getSubscription();

          if (!isMounted) return;

          if (subscription) {
            setIsSubscribed(true);
            await api.post("/api/notifications/subscribe", { subscription });
          }
        } catch (error) {
          console.error("Erro ao sincronizar subscription", error);
        }
      }
    }

    void checkAndSync();
    void prepareNotificationSetup().catch((error: unknown) => {
      console.error("Erro ao preparar notificações", error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const requestPermission = async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      toast.error("Navegador não suporta notificações");
      return;
    }

    const result =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    setPermission(result);

    if (result !== "granted") {
      toast.error("Permissão para notificações não concedida.");
      return;
    }

    const { registration, applicationServerKey } =
      await prepareNotificationSetup();
    const existingSubscription =
      await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }));

    await api.post("/api/notifications/subscribe", { subscription });
    setIsSubscribed(true);
    toast.success("Notificações ativadas!");
  };

  const toggleNotifications = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (isSubscribed) {
        const registration = await getServiceWorkerRegistration();
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await api.post("/api/notifications/unsubscribe", {
            endpoint: subscription.endpoint,
          });
          await subscription.unsubscribe();
        }

        setIsSubscribed(false);
        toast.success("Notificações desativadas neste dispositivo.");
      } else {
        await requestPermission();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado.";
      toast.error(`Não foi possível atualizar as notificações: ${message}`);
      console.error("Erro ao atualizar notificações", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const scheduleEventNotification = async (event: {
    id: string;
  }) => {
    if (permission !== "granted") return;

    try {
      await api.post("/api/notifications/schedule-event", {
        eventId: event.id,
      });
    } catch (error) {
      console.error("Erro ao orquestrar agendamento de evento:", error);
    }
  };

  return {
    permission,
    isSubscribed,
    isProcessing,
    requestPermission,
    toggleNotifications,
    scheduleEventNotification,
  };
}
