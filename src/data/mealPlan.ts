export type Meal = {
  icon: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
};

export type DayPlan = {
  day: string;
  date: string;
  meals: Meal[];
};

export type RecipeDetails = {
  ingredients: string[];
  instructions: string[];
};

export const todayMeals: Meal[] = [
  { icon: "🥣", type: "Breakfast", name: "Protein oatmeal", calories: 520, protein: 35, carbs: 58, fat: 16, time: 10 },
  { icon: "🥗", type: "Lunch", name: "Colorful chicken salad", calories: 480, protein: 42, carbs: 35, fat: 16, time: 25 },
  { icon: "🍎", type: "Snack", name: "Greek yogurt and berries", calories: 320, protein: 25, carbs: 28, fat: 10, time: 5 },
  { icon: "🍝", type: "Dinner", name: "Chicken pasta", calories: 620, protein: 52, carbs: 64, fat: 15, time: 30 },
];

export const weekPlan: DayPlan[] = [
  { day: "Maanantai", date: "14.9.", meals: [
    { icon: "🥣", type: "Breakfast", name: "Banana protein oatmeal", calories: 490, protein: 32, carbs: 60, fat: 12, time: 10 },
    { icon: "🍗", type: "Lunch", name: "Chicken rice bowl", calories: 610, protein: 48, carbs: 70, fat: 14, time: 25 },
    { icon: "🍓", type: "Snack", name: "Yogurt and berries", calories: 280, protein: 22, carbs: 30, fat: 8, time: 5 },
  ] },
  { day: "Tiistai", date: "15.9.", meals: [
    { icon: "🥑", type: "Breakfast", name: "Avocado egg toast", calories: 450, protein: 24, carbs: 38, fat: 22, time: 10 },
    { icon: "🌯", type: "Lunch", name: "Avocado chicken wrap", calories: 510, protein: 39, carbs: 48, fat: 17, time: 20 },
    { icon: "🍌", type: "Snack", name: "Banana and quark", calories: 300, protein: 25, carbs: 35, fat: 5, time: 5 },
  ] },
  { day: "Keskiviikko", date: "16.9.", meals: [
    { icon: "🥞", type: "Breakfast", name: "Protein pancakes", calories: 510, protein: 34, carbs: 52, fat: 17, time: 15 },
    { icon: "🍲", type: "Lunch", name: "Vegetable soup and wholegrain bread", calories: 420, protein: 20, carbs: 55, fat: 12, time: 35 },
    { icon: "🥜", type: "Snack", name: "Apple and nuts", calories: 290, protein: 7, carbs: 25, fat: 18, time: 2 },
  ] },
  { day: "Torstai", date: "17.9.", meals: [
    { icon: "🥣", type: "Breakfast", name: "Berry overnight oats", calories: 430, protein: 27, carbs: 55, fat: 12, time: 5 },
    { icon: "🐟", type: "Lunch", name: "Salmon bowl with vegetables", calories: 590, protein: 42, carbs: 45, fat: 24, time: 25 },
    { icon: "🍓", type: "Snack", name: "Quark and strawberries", calories: 250, protein: 26, carbs: 20, fat: 5, time: 5 },
  ] },
  { day: "Perjantai", date: "18.9.", meals: [
    { icon: "🍳", type: "Breakfast", name: "Vegetable omelet", calories: 410, protein: 29, carbs: 18, fat: 25, time: 15 },
    { icon: "🍝", type: "Lunch", name: "Chicken pasta", calories: 620, protein: 52, carbs: 64, fat: 15, time: 30 },
    { icon: "🍫", type: "Snack", name: "Chocolate protein quark", calories: 300, protein: 28, carbs: 25, fat: 9, time: 5 },
  ] },
];

export const recipes: Record<string, RecipeDetails> = {
  "Protein oatmeal": {
    ingredients: ["1 dl rolled oats", "2 dl milk", "1 banana", "20 g protein powder", "Berries"],
    instructions: ["Cook the oats in milk.", "Stir in the protein powder.", "Top with banana and berries."],
  },
  "Colorful chicken salad": {
    ingredients: ["150 g chicken breast", "Lettuce", "1 tomato", "½ cucumber", "Yogurt dressing"],
    instructions: ["Cook the chicken and cut it into pieces.", "Chop the vegetables.", "Assemble the salad on a plate.", "Add the chicken and yogurt dressing."],
  },
  "Greek yogurt and berries": {
    ingredients: ["200 g Greek yogurt", "100 g berries", "1 banana", "A small handful of nuts"],
    instructions: ["Add the yogurt to a bowl.", "Add the berries and banana.", "Finish with nuts."],
  },
  "Chicken pasta": {
    ingredients: ["150 g chicken", "100 g pasta", "½ bell pepper", "½ onion", "Light cooking cream"],
    instructions: ["Cook the pasta.", "Fry the chicken and vegetables in a pan.", "Add the cooking cream.", "Stir the pasta into the sauce."],
  },
};

export const groceryItems = ["Rolled oats", "Greek yogurt", "Chicken breast", "Green vegetables", "Wholegrain pasta"];
