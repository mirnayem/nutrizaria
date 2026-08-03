export type ConsentChoice = "accepted" | "rejected" | null;

const STORAGE_KEY = "nutrizaria.consent.v1";
const CONSENT_EVENT = "nutrizaria:consent";

export function getStoredConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function useConsent() {
  const consent = useState<ConsentChoice>("consent", () => getStoredConsent());

  const setConsent = (choice: Exclude<ConsentChoice, null>) => {
    consent.value = choice;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, choice);
      window.dispatchEvent(
        new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }),
      );
    }
  };

  return { consent, setConsent };
}
