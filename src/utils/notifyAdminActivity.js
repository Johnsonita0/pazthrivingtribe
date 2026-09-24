export async function notifyAdminActivity(type, title, details) {
  try {
    const response = await fetch('/api/activity-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, details })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Admin notification failed');
    }
  } catch (error) {
    console.error('Admin activity notification failed:', error);
  }
}