export function track(eventName: string, eventData?: umami.EventData) {
  try {
    if (eventData) {
      window.umami.track(eventName, eventData);
    } else {
      window.umami.track(eventName);
    }
  } catch (error) {
    console.warn("Umami tracking error:", error);
  }
}
