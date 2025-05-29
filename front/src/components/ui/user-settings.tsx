"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";

interface UserSettingsProps {
  onClose: () => void;
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const { user } = useAuth();
  const [messageColor, setMessageColor] = useState(
    user?.messageColor || "#3B82F6"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      await authApi.updateProfile({ messageColor });
      setMessage("Profil mis à jour avec succès !");

      // Fermer le modal après 1.5 secondes
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recharger pour mettre à jour les données
      }, 1500);
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du profil");
      console.error("Update profile failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Paramètres du profil
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d&apos;utilisateur
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
              {user?.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
              {user?.email}
            </div>
          </div>

          <ColorPicker
            value={messageColor}
            onChange={setMessageColor}
            label="Couleur de vos messages"
          />
        </div>

        {message && (
          <div
            className={`mt-4 text-sm text-center ${
              message.includes("succès") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </div>
  );
}
