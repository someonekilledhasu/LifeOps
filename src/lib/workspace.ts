import { prisma } from "@/lib/prisma";

const DEFAULT_USER_EMAIL = "user@lifeops.app";
const DEFAULT_USER_NAME = "Hasini";

/**
 * Resolved app user backed by the database.
 * Lazily initialized on first access via `getAppUser()`.
 */
let resolvedUser: { id: string; email: string; name: string } | null = null;

/**
 * Returns the current application user, creating a default
 * database-backed user if one does not exist yet.
 */
export async function getAppUser() {
  if (resolvedUser) return resolvedUser;

  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });

  if (existing) {
    resolvedUser = { id: existing.id, email: existing.email, name: existing.name };
    return resolvedUser;
  }

  const created = await prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
      settings: {
        create: {
          monthlyBudget: 30000,
          currency: "INR",
          dietaryPreference: "flexible",
          favoriteCuisines: ["Indian", "Asian", "Mediterranean"],
          darkMode: false,
          onboardingDone: false,
        },
      },
    },
  });

  resolvedUser = { id: created.id, email: created.email, name: created.name };
  return resolvedUser;
}
