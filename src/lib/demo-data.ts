import type {
  ExpenseRecord,
  FoodDecisionRecord,
  GeneratedMessageRecord,
} from "@/lib/types";

const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const demoExpenses: ExpenseRecord[] = [
  { id: "ex-1", date: isoDaysAgo(0), merchant: "Blue Tokai", amount: 420, category: "Food", notes: "Coffee with Neha" },
  { id: "ex-2", date: isoDaysAgo(1), merchant: "Uber", amount: 285, category: "Transport" },
  { id: "ex-3", date: isoDaysAgo(2), merchant: "Blinkit", amount: 1260, category: "Food", notes: "Weekly groceries" },
  { id: "ex-4", date: isoDaysAgo(3), merchant: "Netflix", amount: 649, category: "Subscriptions" },
  { id: "ex-5", date: isoDaysAgo(4), merchant: "Cult.fit", amount: 1499, category: "Health" },
  { id: "ex-6", date: isoDaysAgo(5), merchant: "Metro card", amount: 500, category: "Transport" },
  { id: "ex-7", date: isoDaysAgo(6), merchant: "Zomato", amount: 780, category: "Food" },
  { id: "ex-8", date: isoDaysAgo(8), merchant: "Amazon", amount: 2299, category: "Shopping" },
  { id: "ex-9", date: isoDaysAgo(10), merchant: "Airtel", amount: 799, category: "Bills" },
  { id: "ex-10", date: isoDaysAgo(12), merchant: "Spotify", amount: 119, category: "Subscriptions" },
  { id: "ex-11", date: isoDaysAgo(16), merchant: "Zomato", amount: 540, category: "Food" },
  { id: "ex-12", date: isoDaysAgo(22), merchant: "BookMyShow", amount: 620, category: "Entertainment" },
];

export const demoFoodDecisions: FoodDecisionRecord[] = [
  {
    id: "food-1",
    createdAt: isoDaysAgo(1),
    mood: "Something comforting",
    mode: "Order in",
    suggestions: [{
      title: "Paneer tikka bowl",
      estimatedCost: 320,
      whyItFits: "Comforting, filling and still balanced.",
      healthiness: 4,
      budgetFit: 5,
      nextStep: "Order with brown rice and extra salad.",
    }],
  },
  {
    id: "food-2",
    createdAt: isoDaysAgo(3),
    mood: "Quick weekday dinner",
    mode: "Cook",
    suggestions: [{
      title: "Chilli garlic tofu noodles",
      estimatedCost: 180,
      whyItFits: "Fast, spicy and uses pantry basics.",
      healthiness: 4,
      budgetFit: 5,
      nextStep: "Stir fry tofu and vegetables while the noodles boil.",
    }],
  },
  {
    id: "food-3",
    createdAt: isoDaysAgo(6),
    mood: "Light lunch",
    mode: "Eat out",
    suggestions: [{
      title: "Mediterranean falafel plate",
      estimatedCost: 390,
      whyItFits: "Fresh, varied and easy to customize.",
      healthiness: 5,
      budgetFit: 4,
      nextStep: "Ask for dressing on the side.",
    }],
  },
];

export const demoMessages: GeneratedMessageRecord[] = [
  {
    id: "msg-1",
    situation: "Following up on application",
    tone: "Polite",
    recipient: "Hiring manager",
    context: "Checking in after a product internship interview last week.",
    subject: "Following up on product internship interview",
    body: "Hi, I hope you are doing well. I wanted to follow up on my product internship interview last week. I remain very interested in the role and would appreciate any update you can share on the next steps. Thank you for your time.",
    shortVersion: "Hi, I wanted to follow up on my product internship interview last week. I remain very interested and would appreciate any update on the next steps. Thank you.",
    polished: "Hello, I hope your week is going well. I am writing to follow up on our conversation about the product internship. The opportunity continues to feel like a strong fit, and I would be grateful for any update you can share regarding the next steps. Thank you again for your time and consideration.",
    createdAt: isoDaysAgo(2),
  },
];
