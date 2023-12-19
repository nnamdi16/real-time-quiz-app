import { OptionsDto, QuestionDto, QuizDto } from 'src/api/quiz/quiz.dto';

const options: OptionsDto[] = [
  {
    text: '3',
    isCorrect: true,
  },
  {
    text: '2',
    isCorrect: false,
  },
];

const questions: QuestionDto[] = [
  {
    title: 'Find the sum of 1 and 2',
    options,
  },
];
export const quizPayload: QuizDto = {
  title: 'Math Quiz',
  questions,
};
export const quiz = {
  title: 'Maths Quiz',
  questions: [
    {
      title: 'Find the sum of 1 and 2',
      options: [
        {
          text: '3',
          createdBy: null,
          updatedBy: null,
          id: '53e67897-ba7c-4846-93e1-7f910446d35a',
          createdDate: '2023-12-19T00:29:20.497Z',
          updatedDate: '2023-12-19T00:29:20.497Z',
        },
        {
          text: '2',
          createdBy: null,
          updatedBy: null,
          id: '678f197e-118c-4c54-8545-e45e06e1944f',
          createdDate: '2023-12-19T00:29:20.497Z',
          updatedDate: '2023-12-19T00:29:20.497Z',
        },
      ],
      createdBy: null,
      updatedBy: null,
      id: 'f448b672-f8e5-42b1-b4d4-1062b9065a68',
      createdDate: '2023-12-19T00:29:20.497Z',
      updatedDate: '2023-12-19T00:29:20.497Z',
    },
  ],
  createdBy: null,
  updatedBy: null,
  id: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
  createdDate: new Date('2023-12-19T00:29:20.497Z'),
  updatedDate: new Date('2023-12-19T00:29:20.497Z'),
};
