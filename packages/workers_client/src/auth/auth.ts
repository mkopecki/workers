import { create } from "zustand";

type User = {
  id: string;
  type: "user" | "guest";
  email?: string;
};

type AuthStore = {
  user: User | null;
  set_user: (user: User) => void;
};

export const use_auth_store = create<AuthStore>((set) => ({
  user: null,
  set_user: (user: User) => set({ user }),
}));
