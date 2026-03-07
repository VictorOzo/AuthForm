export type UserRecord = {
  id: string;
  email: string;
};

export const db = {
  users: [] as UserRecord[],
};
