import { build_server_url } from "@/api";
import { useEffect } from "react";
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

const use_auth_store = create<AuthStore>((set) => ({
  user: null,
  set_user: (user: User) => set({ user }),
}));

export const use_auth = () => {
  const auth_store = use_auth_store();

  useEffect(() => {
    const url = build_server_url("/api/user");
    fetch(url, {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          auth_store.set_user(data);
        } else {
          const url = build_server_url("/auth/user/guest");
          await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
        }
      })
      .catch(async (error) => {
        console.error(error);
      });
  }, []);

  const signin_user = async (email: string, password: string) => {
    const payload = {
      email,
      password,
    };

    const url = build_server_url("/auth/user/session");
    const user = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    console.log(user);
  };
  const signup_user = async (email: string, password: string) => {
    const payload = {
      email,
      password,
    };

    const url = build_server_url("/auth/user");
    const user = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    console.log(user);
  };

  const reload = () => {
    const url = build_server_url("/api/user");
    fetch(url, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        auth_store.set_user(data);
      })
      .catch(async (error) => {
        console.error(error);
      });
  };

  return {
    user: auth_store.user,
    reload,

    signin_user,
    signup_user,
  };
};
