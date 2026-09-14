/**
 * Systembesked når hvilen er slut.
 *
 * Grænsen er værd at kende: appen har ingen server, så der er ingen web push. Beskeden kan kun
 * sendes af siden selv, og en side, iOS har lagt i dvale (låst skærm i længere tid), kører ikke.
 * Derfor sendes beskeden både når timeren rammer nul, og når siden vågner igen og hvilen imens
 * er udløbet — se RestTimer. Det dækker skærmen slukket kortvarigt og app i baggrunden; en
 * telefon der har ligget låst længe, får beskeden i det øjeblik den åbnes igen.
 *
 * ponytail: ingen push-server. Skal beskeden komme på en låst telefon uden at åbne appen,
 * kræver det en rigtig push-backend (VAPID + abonnement) — det er en anden størrelse opgave.
 */

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Skal kaldes inde i et tryk — browsere afviser en forespørgsel uden brugerhandling. */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function notifyRestDone(): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const options: NotificationOptions = {
    body: "Klar til næste sæt.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "vigorra-rest",
    /* Uden dette lukker iOS beskeden lydløst, hvis der allerede ligger en med samme tag. */
    renotify: true,
  } as NotificationOptions;

  try {
    /* Service worker-beskeden er den eneste, iOS viser for en installeret app. */
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification("Hvilen er slut", options);
      return;
    }
    new Notification("Hvilen er slut", options);
  } catch {
    /* En blokeret eller ikke-understøttet besked må ikke vælte timeren. */
  }
}
