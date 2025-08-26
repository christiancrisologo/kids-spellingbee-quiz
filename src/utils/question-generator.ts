import data from '../configs/data.json';
import { Categories, Difficulty, QuestionType } from "@/store/quiz-store";

// Simple question generator for demonstration purposes
export const generateQuestions = (
  numberOfQuestions: number,
  difficulty: Difficulty,
  questionType: QuestionType,
  categories: Categories
) => {
  // Filter words by selected categories and difficulty
  const availableCategories = categories.includes('all')
    ? ['places', 'animals', 'persons', 'science', 'actions', 'other', 'technology', 'food', 'thing', 'emotion', 'people', 'nature', 'sports', 'music', 'art', 'time', 'clothing', 'plants', 'math', 'household', 'game']
    : categories;

  // Map difficulty to data.json values
  const difficultyMap: Record<string, string[]> = {
    easy: ['easy'],
    hard: ['hard', 'medium'],
  };
  const allowedDifficulties = difficultyMap[difficulty] || [difficulty];

  // Filter words
  const filteredWords = (data as unknown as Array<{
      definition: any;
      synonyms: never[];
      antonyms: never[]; category: string; difficulty: string; word: string 
}> ).filter(wordObj =>
    availableCategories.includes(wordObj.category) &&
    allowedDifficulties.includes(wordObj.difficulty)
  );

  // Shuffle and pick required number
  const shuffled = filteredWords.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numberOfQuestions);

  // Generate questions
  return selected.map((wordObj, i) => {
    let options: string[] = [];
    if (questionType === 'multiple-choice') {
      // Pick a random distractor
      const distractors = filteredWords.filter(w => w.word !== wordObj.word);
      const distractor = distractors.length > 0 ? distractors[Math.floor(Math.random() * distractors.length)].word : '';
      options = [wordObj.word, distractor].sort(() => Math.random() - 0.5);
    }
    return {
      id: i + 1,
      question: wordObj.word,
      answer: wordObj.word,
      definition: wordObj.definition,
      category: wordObj.category,
      synonyms: wordObj.synonyms || [],
      antonyms: wordObj.antonyms || [],
      options,
      timeSpent: 0,
      difficulty,
      questionType,
      categories,
      numLetters: wordObj.word.length,
    };
  });
};

