import { useEffect } from "react";
import { use_auth_store } from "./auth";
import { build_server_url } from "@/api";
import { useNavigate } from "react-router";

export const use_auth_guard = () => {
  const auth_store = use_auth_store();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("running AuthGuard");
    if (auth_store.user) {
      return;
    }

    const user_url = build_server_url("/api/user");
    fetch(user_url, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 200) {
          const user_data = await res.json();
          auth_store.set_user(user_data);
        } else {
          navigate("/login");
        }
      })
      .catch((e) => {
        console.error(e);
        navigate("/login");
      });

    // check if user is correctly authenticated, otherwise redirect
  }, []);
};
