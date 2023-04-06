export function deleteCookie(name: string, path?: string, domain?: string) {
  setCookie(name, "", -1, path, domain);
}

export function setCookie(name: string, value: string, days: number = 0, path?: string, domain?: string): void {
  document.cookie = getCookieString(name, value, days, path, domain);
}

export function getCookieString(name: string, value: string, days: number = 0, path?: string, domain?: string) {
  return `${name}=${value}; ${expiresIn(days)}; path=${path || "/"}${domain
    ? `; domain=${domain}`
    : ""}`;
}

/**
 * When days is 0, returns a browser cookie (expires when window closed)
 * When days is negative, it returns expired string
 * @param days number 0
 * @returns string
 */
export function expiresIn(days: number = 0) {
  if (days !== 0) {
    const date = days > 0
    ? getDaysFromNowInMilliseconds(days)
    : new Date(0);
    return `expires=${date.toUTCString()}`;
  }
  return "";
}

export function getDaysFromNowInMilliseconds(days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
}