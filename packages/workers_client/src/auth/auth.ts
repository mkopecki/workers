import { build_server_url } from "@/api";
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

export const get_user_data = async (
  auth_store: AuthStore,
): Promise<User | null> => {
  try {
    if (auth_store.user) {
      return auth_store.user;
    }

    const user_url = build_server_url("/api/user");
    const res = await fetch(user_url, { credentials: "include" });
    if (res.status === 200) {
      const user_data = await res.json();
      auth_store.set_user(user_data);
      return user_data;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};
