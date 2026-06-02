export const GUEST_USER_ID = "guest-workspace";
export const GUEST_EMAIL = "guest@lifeops.app";

export const APP_USER = {
  id: GUEST_USER_ID,
  email: GUEST_EMAIL,
  name: "Hasini",
};

export function getAppUser() {
  return APP_USER;
}

export function isGuestUser(userId: string) {
  return userId === GUEST_USER_ID;
}
