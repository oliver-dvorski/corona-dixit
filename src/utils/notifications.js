export async function notify(message) {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    return new Notification(message);
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    await notify(message);
  }
}
