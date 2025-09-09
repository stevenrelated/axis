'use server';

export type AppUser = {
  id: string;
  email: string | null;
};

export type AppSession = {
  user: AppUser & { type: 'regular' };
};
