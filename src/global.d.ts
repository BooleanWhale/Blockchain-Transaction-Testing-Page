interface Window {
  ethereum?: {
    isConnected(): boolean;
    request: (...args: any[]) => Promise<any>;
  }
}