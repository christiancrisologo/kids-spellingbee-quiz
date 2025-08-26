// src/constants/initialFormData.ts
import type { QuizSettings } from '../store/quiz-store';

export const initialFormData: QuizSettings = {
  username: '',
  difficulty: 'easy',
  numberOfQuestions: 5,
  timerPerQuestion: 10,
  questionType: 'input',
  categories: ['animals', 'actions', 'persons', 'places', 'science', 'technology', 'other', 'all'],
  timerEnabled: true,
  questionsEnabled: true,
  minCorrectAnswers: 0,
  maxCorrectAnswers: 5,
  correctAnswersEnabled: false,
  minIncorrectAnswers: 0,
  maxIncorrectAnswers: 5,
  incorrectAnswersEnabled: false,
  overallTimerEnabled: false,
  overallTimerDuration: 180,
  challengeMode: undefined,
};
