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

export type RecipeDetails = {
  ingredients: string[];
  instructions: string[];
};
