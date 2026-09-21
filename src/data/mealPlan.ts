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
  { icon: "🥣", type: "Aamupala", name: "Proteiinikaurapuuro", calories: 520, protein: 35, carbs: 58, fat: 16, time: 10 },
  { icon: "🥗", type: "Lounas", name: "Värikäs kanasalaatti", calories: 480, protein: 42, carbs: 35, fat: 16, time: 25 },
  { icon: "🍎", type: "Välipala", name: "Kreikkalainen jogurtti ja marjat", calories: 320, protein: 25, carbs: 28, fat: 10, time: 5 },
  { icon: "🍝", type: "Päivällinen", name: "Kana-pasta", calories: 620, protein: 52, carbs: 64, fat: 15, time: 30 },
];

export const weekPlan: DayPlan[] = [
  { day: "Maanantai", date: "14.9.", meals: [
    { icon: "🥣", type: "Aamupala", name: "Banaani-proteiinipuuro", calories: 490, protein: 32, carbs: 60, fat: 12, time: 10 },
    { icon: "🍗", type: "Lounas", name: "Kana-riisikulho", calories: 610, protein: 48, carbs: 70, fat: 14, time: 25 },
    { icon: "🍓", type: "Välipala", name: "Jogurtti ja marjat", calories: 280, protein: 22, carbs: 30, fat: 8, time: 5 },
  ] },
  { day: "Tiistai", date: "15.9.", meals: [
    { icon: "🥑", type: "Aamupala", name: "Avokado-kananmunaleipä", calories: 450, protein: 24, carbs: 38, fat: 22, time: 10 },
    { icon: "🌯", type: "Lounas", name: "Avokado-kanawrap", calories: 510, protein: 39, carbs: 48, fat: 17, time: 20 },
    { icon: "🍌", type: "Välipala", name: "Banaani ja rahka", calories: 300, protein: 25, carbs: 35, fat: 5, time: 5 },
  ] },
  { day: "Keskiviikko", date: "16.9.", meals: [
    { icon: "🥞", type: "Aamupala", name: "Proteiinipannukakut", calories: 510, protein: 34, carbs: 52, fat: 17, time: 15 },
    { icon: "🍲", type: "Lounas", name: "Kasviskeitto ja täysjyväleipä", calories: 420, protein: 20, carbs: 55, fat: 12, time: 35 },
    { icon: "🥜", type: "Välipala", name: "Omena ja pähkinät", calories: 290, protein: 7, carbs: 25, fat: 18, time: 2 },
  ] },
  { day: "Torstai", date: "17.9.", meals: [
    { icon: "🥣", type: "Aamupala", name: "Marjainen tuorepuuro", calories: 430, protein: 27, carbs: 55, fat: 12, time: 5 },
    { icon: "🐟", type: "Lounas", name: "Lohibowl kasviksilla", calories: 590, protein: 42, carbs: 45, fat: 24, time: 25 },
    { icon: "🍓", type: "Välipala", name: "Rahka ja mansikat", calories: 250, protein: 26, carbs: 20, fat: 5, time: 5 },
  ] },
  { day: "Perjantai", date: "18.9.", meals: [
    { icon: "🍳", type: "Aamupala", name: "Kasvismunakas", calories: 410, protein: 29, carbs: 18, fat: 25, time: 15 },
    { icon: "🍝", type: "Lounas", name: "Kana-pasta", calories: 620, protein: 52, carbs: 64, fat: 15, time: 30 },
    { icon: "🍫", type: "Välipala", name: "Suklaa-proteiinirahka", calories: 300, protein: 28, carbs: 25, fat: 9, time: 5 },
  ] },
];

export const recipes: Record<string, RecipeDetails> = {
  Proteiinikaurapuuro: {
    ingredients: ["1 dl kaurahiutaleita", "2 dl maitoa", "1 banaani", "20 g proteiinijauhetta", "Marjoja"],
    instructions: ["Keitä kaurahiutaleet maidossa.", "Sekoita joukkoon proteiinijauhe.", "Lisää päälle banaani ja marjat."],
  },
  "Värikäs kanasalaatti": {
    ingredients: ["150 g kanafileetä", "Salaattia", "1 tomaatti", "½ kurkkua", "Jogurttikastiketta"],
    instructions: ["Paista kana kypsäksi ja leikkaa paloiksi.", "Pilko kasvikset.", "Kokoa salaatti lautaselle.", "Lisää kana ja jogurttikastike."],
  },
  "Kreikkalainen jogurtti ja marjat": {
    ingredients: ["200 g kreikkalaista jogurttia", "100 g marjoja", "1 banaani", "Pieni määrä pähkinöitä"],
    instructions: ["Laita jogurtti kulhoon.", "Lisää marjat ja banaani.", "Viimeistele pähkinöillä."],
  },
  "Kana-pasta": {
    ingredients: ["150 g kanaa", "100 g pastaa", "½ paprika", "½ sipuli", "Kevyt ruokakerma"],
    instructions: ["Keitä pasta.", "Paista kana ja kasvikset pannulla.", "Lisää ruokakerma.", "Sekoita pasta kastikkeen joukkoon."],
  },
};

export const groceryItems = ["Kaurahiutaleet", "Kreikkalainen jogurtti", "Kanan rintafileet", "Vihreät kasvikset", "Täysjyväpasta"];
