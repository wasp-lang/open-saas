import { User } from '@wasp/entities'
import { Prisma } from '@prisma/client'

export type Context = {
  user: User;
  entities: {
    User: Prisma.UserDelegate<{}>;
  };
};

export type StripePaymentResult = {
  sessionUrl: string | null;
  sessionId: string;
};

export type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }
  ];
};