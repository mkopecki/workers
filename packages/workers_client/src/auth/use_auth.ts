import { build_server_url } from "@/api";
import { use_auth_store } from "./auth";

export const use_auth = () => {
  const auth_store = use_auth_store();

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
