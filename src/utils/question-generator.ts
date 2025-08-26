import { Categories, Difficulty, QuestionType } from "@/store/quiz-store";

// Simple question generator for demonstration purposes
export const generateQuestions = (
  numberOfQuestions: number,
  difficulty: Difficulty,
  questionType: QuestionType,
  categories: Categories
) => {
  // For now, just generate dummy questions based on the selected categories and type
  const questions = [];
  const availableCategories = categories.includes('all')
    ? ['countries', 'animals', 'persons', 'science', 'actions']
    : categories;

  for (let i = 0; i < numberOfQuestions; i++) {
    const category = availableCategories[i % availableCategories.length];
    let questionText = '';
    let options: string[] = [];
    let answer = '';

    // Example logic for question generation
    if (questionType === 'input') {
      // Math expression question
      const a = difficulty === 'hard' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 1;
      const b = difficulty === 'hard' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 1;
      questionText = `${a} + ${b} = ?`;
      answer = String(a + b);
    } else if (questionType === 'multiple-choice') {
      // Multiple choice question
      const a = difficulty === 'hard' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 1;
      const b = difficulty === 'hard' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 1;
      questionText = `${a} + ${b} = ?`;
      answer = String(a + b);
      options = [
        String(a + b),
        String(a + b + Math.floor(Math.random() * 5) + 1),
        String(a + b - Math.floor(Math.random() * 5) - 1)
      ].sort(() => Math.random() - 0.5);
    } else {
      // Default fallback
      questionText = `Question ${i + 1} (${category})`;
      answer = 'answer';
    }

    questions.push({
      id: i + 1,
      question: questionText,
      answer,
      userAnswer: answer,
      isCorrect: true,
      options,
      timeSpent: 0,
      difficulty,
      questionType,
      categories,
    });
  }

  return questions;
}

