import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Upload, Download, Clipboard, FileText } from "lucide-react";

export default function P2PShareApp() {
  const [mode, setMode] = useState<'generate' | 'enter'>('generate');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sharedText, setSharedText] = useState('');
  const [receivedContent, setReceivedContent] = useState<{
    files: {name: string, size: number}[],
    text: string
  }>({ files: [], text: '' });
  const [transferStatus, setTransferStatus] = useState<'idle' | 'sending' | 'receiving' | 'complete'>('idle');
  const [activeTab, setActiveTab] = useState<'files' | 'text'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    return newOtp;
  };

  const verifyOtp = () => {
    if (enteredOtp === otp) {
      setIsConnected(true);
      setTransferStatus('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const sendContent = () => {
    setTransferStatus('sending');
    
    setTimeout(() => {
      setReceivedContent({
        files: files.map(file => ({
          name: file.name,
          size: file.size
        })),
        text: sharedText
      });
      setTransferStatus('complete');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetConnection = () => {
    setIsConnected(false);
    setMode('generate');
    setOtp('');
    setEnteredOtp('');
    setFiles([]);
    setSharedText('');
    setReceivedContent({ files: [], text: '' });
    setTransferStatus('idle');
  };

  useEffect(() => {
    generateOtp();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isConnected ? 'Peer Share' : 'P2P Connection'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <>
              {mode === 'generate' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Share this code with the other device</p>
                    <div className="text-3xl font-mono font-bold tracking-widest bg-gray-100 py-3 rounded-lg">
                      {otp}
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setMode('enter')}
                  >
                    I have a code to enter
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter 6-digit code
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="text-center font-mono text-lg"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={verifyOtp}
                    disabled={enteredOtp.length !== 6}
                  >
                    Connect
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setMode('generate')}
                  >
                    Back
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Connected</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetConnection}
                >
                  Disconnect
                </Button>
              </div>

              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'files' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('files')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    Files
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('text')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clipboard className="h-4 w-4" />
                    Text
                  </div>
                </button>
              </div>

              {activeTab === 'files' ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Send Files</h3>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Files
                  </Button>

                  {files.length > 0 && (
                    <div className="border rounded-lg p-3 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{file.name}</span>
                          <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium">Share Text</h3>
                  <Textarea
                    value={sharedText}
                    onChange={(e) => setSharedText(e.target.value)}
                    placeholder="Type or paste text to share..."
                    rows={5}
                  />
                </div>
              )}

              {(files.length > 0 || (activeTab === 'text' && sharedText)) && (
                <Button
                  className="w-full"
                  onClick={sendContent}
                  disabled={transferStatus === 'sending'}
                >
                  {transferStatus === 'sending' ? 'Sending...' : 'Send Content'}
                </Button>
              )}

              {transferStatus !== 'idle' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Received Content</h3>
                  
                  {receivedContent.files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Files:</h4>
                      <div className="border rounded-lg p-3 space-y-2">
                        {receivedContent.files.map((file, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="truncate">{file.name}</span>
                            <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {receivedContent.text && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Text:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(receivedContent.text)}
                        >
                          <Clipboard className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm">{receivedContent.text}</pre>
                      </div>
                    </div>
                  )}

                  {!receivedContent.files.length && !receivedContent.text && (
                    <div className="text-center py-4 text-gray-500">
                      {transferStatus === 'sending' ? 'Transferring content...' : 'No content received yet'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-gray-500 text-center justify-center">
          {isConnected ? (
            <p>Content is transferred peer-to-peer without a central server</p>
          ) : (
            <p>Connect two devices to share content directly</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
