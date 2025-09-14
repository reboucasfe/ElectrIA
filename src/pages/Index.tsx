import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";

const Index = () => {
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkApiStatus = async () => {
    setIsLoading(true);
    setApiStatus(null);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      if (response.ok) {
        setApiStatus(`Success: ${data.message}`);
        showSuccess("Database connection is successful!");
      } else {
        setApiStatus(`Error: ${data.message}`);
        showError("Failed to connect to the database.");
      }
    } catch (error) {
      console.error("Failed to fetch API status:", error);
      const errorMessage = "Could not connect to the API server. Is it running?";
      setApiStatus(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Click the button to verify the connection between the API server and your Supabase database.
          </p>
          <Button onClick={checkApiStatus} disabled={isLoading}>
            {isLoading ? "Checking..." : "Test Connection"}
          </Button>
          {apiStatus && (
            <div className="mt-4 p-3 rounded-md w-full text-center bg-gray-100 dark:bg-gray-800">
              <p className="text-sm font-mono">{apiStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;