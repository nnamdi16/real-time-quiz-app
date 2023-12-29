import {
  OptionsDto,
  QuestionDto,
  QuizDto,
  QuizParams,
} from 'src/api/quiz/dto/quiz.dto';

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
  streak: 3,
  streakScore: 10,
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

export const quizParams: QuizParams = {
  id: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
};

export const mockedQuestion = {
  id: 'f448b672-f8e5-42b1-b4d4-1062b9065a68',
  createdDate: '2023-12-19T00:29:20.497Z',
  updatedDate: '2023-12-19T00:29:20.497Z',
  createdBy: null,
  updatedBy: null,
  title: 'Find the sum of 1 and 2',
  quiz: {
    id: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
    createdDate: '2023-12-19T00:29:20.497Z',
    updatedDate: '2023-12-19T00:29:20.497Z',
    createdBy: null,
    updatedBy: null,
    title: 'Maths Quiz',
  },
  options: [
    {
      id: '53e67897-ba7c-4846-93e1-7f910446d35a',
      createdDate: '2023-12-19T00:29:20.497Z',
      updatedDate: '2023-12-19T00:29:20.497Z',
      createdBy: null,
      updatedBy: null,
      text: '3',
    },
  ],
};

export const mockedOngoingQuiz = {
  status: 'ONGOING',
  quiz: {
    id: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
    createdDate: '2023-12-19T00:29:20.497Z',
    updatedDate: '2023-12-19T00:29:20.497Z',
    createdBy: null,
    updatedBy: null,
    title: 'Maths Quiz',
  },
  user: {
    id: 'e7e1e3ee-ac78-4a29-b2ad-c323435f065f',
    email: 'johndoe@example.com',
    username: 'John#123',
    iat: 1703093006,
    exp: 1703096606,
  },
  response: [
    {
      options: ['53e67897-ba7c-4846-93e1-7f910446d35a'],
      question: 'f448b672-f8e5-42b1-b4d4-1062b9065a68',
    },
  ],
  score: 1,
  createdBy: null,
  updatedBy: null,
  id: '1e9ff003-a97d-423a-853d-07fce03a94f9',
  createdDate: '2023-12-20T17:23:51.780Z',
  updatedDate: '2023-12-20T17:23:51.780Z',
};

export const mockedLeaderBoard = {
  status: 'success',
  statusCode: 200,
  message: 'User score retrieved successfully',
  data: [
    {
      score: 1,
      user: {
        username: 'John#123',
      },
    },
    {
      score: 3,
      user: {
        username: 'jane#123',
      },
    },
  ],
  error: null,
};

export const mockedListOfQuiz = {
  status: 'success',
  statusCode: 200,
  message: 'Quiz fetched successfully',
  data: [
    {
      id: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
      createdDate: '2023-12-19T00:29:20.497Z',
      updatedDate: '2023-12-19T00:29:20.497Z',
      createdBy: null,
      updatedBy: null,
      title: 'Maths Quiz',
    },
    {
      id: '8ea68374-db33-419c-8c88-e2a2807cb891',
      createdDate: '2023-12-19T01:30:37.470Z',
      updatedDate: '2023-12-19T01:30:37.470Z',
      createdBy: null,
      updatedBy: null,
      title: 'Maths Quiz 2',
    },
  ],
  error: null,
};
