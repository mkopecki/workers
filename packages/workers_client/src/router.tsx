import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "./app/layout";
import { Login } from "./app/login";
import { Signup } from "./app/signup";
import { ThreadsLayout } from "./app/threads/layout";
import { NewThread } from "./components/thread/NewThread";
import { ThreadCreationForm } from "./components/thread_creation_form/ThreadCreationForm";
import { ThreadLayout } from "./components/thread/ThreadLayout";
import { ThreadChat } from "./components/thread/ThreadChat";
import { ThreadTree } from "./components/thread/ThreadTree";
import { RootPage } from "./app/page";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<RootLayout />}>
          <Route index element={<RootPage />} />

          <Route path="/threads" element={<ThreadsLayout />}>
            <Route index element={<NewThread />} />

            <Route path="/threads/create" element={<ThreadCreationForm />} />
            <Route path="/threads/:id" element={<ThreadLayout />}>
              <Route path="/threads/:id/messages" element={<ThreadChat />} />
              <Route path="/threads/:id/tree" element={<ThreadTree />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
