import { useEffect } from "react";
import { get_user_data, use_auth_store } from "./auth";
import { useNavigate } from "react-router";

export const use_auth_guard = () => {
  const auth_store = use_auth_store();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("running AuthGuard");
    if (auth_store.user) {
      return;
    }

    get_user_data(auth_store).then((user) => {
      if (!user) {
        navigate("/login");
      }
    });
  }, []);
};
