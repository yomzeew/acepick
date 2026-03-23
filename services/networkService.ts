import axios from 'axios';
import { API_BASE_URL } from '../utilizes/endpoints';

export interface NetworkStatus {
  isOnline: boolean;
  serverReachable: boolean;
  lastChecked: Date;
  error?: string;
}

class NetworkService {
  private static instance: NetworkService;
  private status: NetworkStatus = {
    isOnline: true,
    serverReachable: false,
    lastChecked: new Date(),
  };
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private async checkServerStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`, {
        timeout: 10000, // Increased timeout for mobile networks
        validateStatus: (status) => status < 500,
      });
      return response.status < 500;
    } catch (error: any) {
      // Log the actual error for debugging
      console.log('Health check failed:', error?.code || error?.message || 'Unknown error');
      return false;
    }
  }

  private async updateStatus(): Promise<void> {
    // Simple approach: try reaching the server. If it responds, we're online.
    const serverReachable = await this.checkServerStatus();
    const isOnline = serverReachable;

    const previousReachable = this.status.serverReachable;
    this.status = {
      isOnline,
      serverReachable,
      lastChecked: new Date(),
      error: !serverReachable ? 'Server unreachable' : undefined,
    };

    if (previousReachable !== serverReachable) {
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.status));
  }

  private startMonitoring(): void {
    this.updateStatus();
    this.checkInterval = setInterval(() => {
      this.updateStatus();
    }, this.CHECK_INTERVAL);
  }

  public getStatus(): NetworkStatus {
    return { ...this.status };
  }

  public isServerReachable(): boolean {
    return this.status.serverReachable;
  }

  public addListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.push(listener);
    listener(this.status);
  }

  public removeListener(listener: (status: NetworkStatus) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public async forceCheck(): Promise<void> {
    await this.updateStatus();
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default NetworkService;
