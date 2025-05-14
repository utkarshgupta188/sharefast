import React, { useState, useEffect } from 'react';
import { Button } from "/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "/components/ui/card";
import { Input } from "/components/ui/input";
import { Check, X, Loader2 } from "lucide-react";

function App() {
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'waiting' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const generateOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${backendUrl}/api/otp`);
      
      if (!response.ok) {
        throw new Error('Failed to generate OTP');
      }
      
      const data = await response.json();
      setOtp(data.otp);
      setConnectionStatus('waiting');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would verify with backend
      if (enteredOtp === otp) {
        setConnectionStatus('connected');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">P2P File Share</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
              <X className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {connectionStatus === 'disconnected' && (
            <Button 
              className="w-full" 
              onClick={generateOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Connection Code'}
            </Button>
          )}
          
          {connectionStatus === 'waiting' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Share this code:</p>
                <div className="text-3xl font-mono font-bold tracking-widest bg-gray-100 py-3 rounded-lg">
                  {otp}
                </div>
              </div>
              <div className="pt-4 border-t">
                <Input 
                  placeholder="Enter connection code" 
                  className="text-center"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                />
                <Button 
                  className="w-full mt-2"
                  onClick={verifyOtp}
                  disabled={enteredOtp.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : 'Connect'}
                </Button>
              </div>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>Successfully Connected!</span>
              </div>
              <p className="text-sm text-gray-600">
                Ready to share files peer-to-peer
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setConnectionStatus('disconnected');
                  setOtp('');
                  setEnteredOtp('');
                }}
              >
                Start New Connection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
