"use client";

import { GoogleLogin } from "@react-oauth/google";

interface GoogleButtonProps {
  onSuccess: (token: string) => void;
}

export function GoogleButton({ onSuccess }: GoogleButtonProps) {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          onSuccess(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.error("Google login failed");
      }}
      theme="outline"
      size="large"
      text="continue_with"
      width="100%"
    />
  );
}