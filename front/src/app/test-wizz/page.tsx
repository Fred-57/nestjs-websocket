"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { chatApi, WizzData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WizzButton } from "@/components/ui/wizz-button";
import { WizzEffect } from "@/components/ui/wizz-effect";
import { WizzNotification } from "@/components/ui/wizz-notification";
import { useRouter } from "next/navigation";

export default function TestWizzPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [conversationId, setConversationId] = useState("");
  const [isWizzing, setIsWizzing] = useState(false);
  const [wizzNotification, setWizzNotification] = useState<{
    show: boolean;
    senderUsername: string;
  }>({ show: false, senderUsername: "" });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (socket) {
      const handleWizzReceived = (data: WizzData) => {
        addLog(
          `Wizz reçu de ${data.senderUsername} pour conversation ${data.conversationId}`
        );

        if (data.senderId !== user?.id) {
          setWizzNotification({
            show: true,
            senderUsername: data.senderUsername,
          });

          setIsWizzing(true);
          setTimeout(() => {
            setIsWizzing(false);
          }, 2000);
        }
      };

      socket.on("wizz-received", handleWizzReceived);

      return () => {
        socket.off("wizz-received", handleWizzReceived);
      };
    }
  }, [socket, user?.id]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const sendTestWizz = async () => {
    if (!conversationId.trim()) {
      addLog("Erreur: ID de conversation requis");
      return;
    }

    try {
      addLog(`Envoi d'un wizz vers la conversation ${conversationId}...`);
      await chatApi.sendWizz(conversationId);
      addLog("Wizz envoyé avec succès !");
    } catch (error) {
      addLog(`Erreur lors de l'envoi du wizz: ${error}`);
    }
  };

  const testSocketConnection = () => {
    if (socket) {
      socket.emit("test", "Test de connexion depuis test-wizz");
      addLog("Message de test envoyé");
    } else {
      addLog("Socket non connectée");
    }
  };

  if (!user) {
    return <div>Redirection vers la connexion...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            🧪 Test de la fonctionnalité Wizz
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone de test */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Informations utilisateur
                </h2>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Socket connectée:</strong>{" "}
                  {isConnected ? "✅ Oui" : "❌ Non"}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Test Wizz</h2>
                <div className="space-y-2">
                  <Input
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
                    placeholder="ID de la conversation"
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <WizzButton onWizzSend={sendTestWizz} />
                    <Button onClick={testSocketConnection} variant="outline">
                      Test Socket
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone d'effet Wizz */}
            <WizzEffect isWizzing={isWizzing}>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Zone d'effet Wizz
                  </h3>
                  <p className="text-blue-600">
                    {isWizzing
                      ? "🪄 WIZZ EN COURS ! 🪄"
                      : "En attente d'un wizz..."}
                  </p>
                </div>
              </div>
            </WizzEffect>
          </div>
        </div>

        {/* Notification Wizz */}
        <WizzNotification
          senderUsername={wizzNotification.senderUsername}
          show={wizzNotification.show}
          onComplete={() =>
            setWizzNotification({ show: false, senderUsername: "" })
          }
        />

        {/* Logs */}
        <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">Logs de debug</h3>
          <div className="max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log pour le moment...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Instructions de test
          </h3>
          <ol className="text-yellow-700 list-decimal list-inside space-y-1">
            <li>Connectez-vous avec un utilisateur</li>
            <li>Ouvrez le dashboard et créez une conversation</li>
            <li>
              Copiez l'ID de la conversation depuis l'URL ou les logs réseau
            </li>
            <li>Revenez sur cette page et collez l'ID</li>
            <li>Cliquez sur le bouton Wizz pour tester l'effet</li>
            <li>
              Ouvrez un autre onglet avec un autre utilisateur pour tester la
              réception
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
