import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Copy, Upload, Download } from "lucide-react"
import { Toaster, toast } from "@/components/ui/sonner"

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function P2PShareFrontend() {
  const [otp, setOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [receivedFiles, setReceivedFiles] = useState<{name: string, size: number}[]>([])
  const [transferStatus, setTransferStatus] = useState<'idle' | 'sending' | 'receiving' | 'complete'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate OTP from backend
  const generateOtp = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/otp`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
        setOtp(data.otp)
        toast.success('OTP generated successfully!')
      } else {
        throw new Error(data.message || 'Failed to generate OTP')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate OTP')
    }
  }

  // Verify OTP with backend
  const verifyOtp = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp: enteredOtp })
      })
      const data = await response.json()
      
      if (response.ok && data.valid) {
        setIsConnected(true)
        setTransferStatus('idle')
        toast.success('Connected successfully!')
      } else {
        throw new Error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection error')
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  // Copy OTP to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(otp)
    toast.success('Copied to clipboard!')
  }

  // Send files to peer
  const sendFiles = async () => {
    if (files.length === 0) return
    
    setTransferStatus('sending')
    
    try {
      // Simulate file transfer (replace with actual WebRTC implementation)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, this would come from WebRTC data channel
      setReceivedFiles(files.map(file => ({
        name: file.name,
        size: file.size
      })))
      
      setTransferStatus('complete')
      toast.success('Files sent successfully!')
    } catch (error) {
      setTransferStatus('idle')
      toast.error('File transfer failed')
    }
  }

  // Reset the connection
  const resetConnection = () => {
    setIsConnected(false)
    setOtp('')
    setEnteredOtp('')
    setFiles([])
    setReceivedFiles([])
    setTransferStatus('idle')
  }

  // Auto-generate OTP when component mounts
  useEffect(() => {
    generateOtp()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Toaster position="top-center" />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isConnected ? 'File Sharing' : 'P2P Connection'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Your OTP code</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-mono font-bold tracking-widest bg-gray-100 py-3 px-4 rounded-lg">
                    {otp || 'Generating...'}
                  </div>
                  {otp && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP code
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
            </div>
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

              <div className="space-y-4">
                <h3 className="font-medium">Share Files</h3>
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

                {files.length > 0 && (
                  <Button
                    className="w-full"
                    onClick={sendFiles}
                    disabled={transferStatus === 'sending'}
                  >
                    {transferStatus === 'sending' ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Files'}
                  </Button>
                )}
              </div>

              {transferStatus !== 'idle' && (
                <div className="space-y-4">
                  <h3 className="font-medium">
                    {transferStatus === 'complete' ? 'Transferred Files' : 'Transfer Status'}
                  </h3>
                  <div className="border rounded-lg p-3 space-y-2">
                    {transferStatus === 'sending' ? (
                      <div className="text-center py-4 text-gray-500">
                        Sending files to peer...
                      </div>
                    ) : receivedFiles.length > 0 ? (
                      receivedFiles.map((file, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{file.name}</span>
                          <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No files received yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-gray-500 text-center justify-center">
          {isConnected ? (
            <p>Files are transferred peer-to-peer without a central server</p>
          ) : (
            <p>Connect two devices to share files directly</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
