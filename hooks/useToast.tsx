import { toast as toastHelper } from "../lib/toast";

export const useToast = () => {
  return { toast: toastHelper };
};
