
export interface NotificationItem {
  id: string;
  actor?: { username?: string; email?: string; handle?: string; id?: string };
  action?: string;
  textPreview?: string;
  createdAt: string;
  read?: boolean;
  url?: string;
  targetType?: string;
  targetId?: string;
}
