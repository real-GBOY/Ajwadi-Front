/** @format */

import apiClient from '../config/axios';
import endPoints from '../config/endPoints';

// Types
export interface RegisterDeviceRequest {
  platform: 'web' | 'android' | 'ios';
  deviceId: string;
  token: string;
}

export interface RegisterDeviceResponse {
  platform: string;
  deviceId: string;
  endpointArn: string;
}

export interface RevokeDeviceRequest {
  platform: 'web' | 'android' | 'ios';
  deviceId: string;
}

export interface TestPushRequest {
  title: string;
  body: string;
  source_event_key?: string;
}

export interface TestPushResponse {
  enqueued: number;
  skipped: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  url: string;
}

export interface NotifyRequest {
  userIds?: string[];
  employeeIds?: string[];
  type: string;
  title: string;
  body: string;
  source_event_key?: string;
  payload?: Record<string, any>;
  actions?: NotificationAction[];
  targets?: ('web' | 'android' | 'ios')[];
}

export interface NotifyResponse {
  enqueued: number;
  skipped: number;
}

export interface BroadcastRequest {
  targetType: 'clients' | 'freelancers' | 'specific';
  userIds?: string[];
  employeeIds?: string[];
  type: string;
  title: string;
  body: string;
  sourceEventKey?: string;
  payload?: Record<string, any>;
  actions?: NotificationAction[];
  targets?: ('web' | 'android' | 'ios')[];
}

export interface BroadcastResponse {
  targetType: string;
  totalRecipients: number;
  userCount: number;
  employeeCount: number;
  enqueued: number;
  skipped: number;
}

class PushNotificationService {
  /**
   * Register a device for push notifications
   */
  async registerDevice(data: RegisterDeviceRequest): Promise<RegisterDeviceResponse> {
    const response = await apiClient.post(endPoints.push.register, data);
    return response.data.data;
  }

  /**
   * Revoke device registration
   */
  async revokeDevice(data: RevokeDeviceRequest): Promise<void> {
    await apiClient.post(endPoints.push.revoke, data);
  }

  /**
   * Send a test push notification to the authenticated user/employee
   */
  async sendTestPush(data: TestPushRequest): Promise<TestPushResponse> {
    const response = await apiClient.post(endPoints.push.test, data);
    return response.data.data;
  }

  /**
   * Send notification to specific users/employees (Employee only)
   */
  async notify(data: NotifyRequest): Promise<NotifyResponse> {
    const response = await apiClient.post(endPoints.push.notify, data);
    return response.data.data;
  }

  /**
   * Broadcast notification (Employee only)
   */
  async broadcast(data: BroadcastRequest): Promise<BroadcastResponse> {
    const response = await apiClient.post(endPoints.push.broadcast, data);
    return response.data.data;
  }
}

export default new PushNotificationService();
