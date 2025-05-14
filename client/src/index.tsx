import React, { useState } from 'react';
import { Button } from "/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "/components/ui/card";
import { Input } from "/components/ui/input";

function App() {
  const [otp, setOtp] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const generateOtp = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/otp`);
      const data = await response.json();
      setOtp(data.otp);
      setConnectionStatus('waiting');
    } catch (error) {
      console.error('Error generating OTP:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>P2P File Share</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === 'disconnected' && (
            <Button className="w-full" onClick={generateOtp}>
              Generate Connection Code
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
                  placeholder="Or enter a code" 
                  className="text-center"
                />
                <Button className="w-full mt-2">
                  Connect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
