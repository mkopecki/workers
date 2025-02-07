import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThreadRuns } from "./pages/ThreadRuns";
import { Layout } from "./layout/Layout";
import { ThreadList } from "./pages/ThreadList";
import { RunView } from "./pages/RunView";
import { ThreadCreationForm } from "./components/thread_creation_form/ThreadCreationForm";
import { ThreadLayout } from "./components/thread/ThreadLayout";
import { ThreadChat } from "./components/thread/ThreadChat";
import { ThreadTree } from "./components/thread/ThreadTree";

const query_client = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={query_client}>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ThreadList />} />
          <Route path="/thread/create" element={<ThreadCreationForm />} />

          <Route path="/thread/:id" element={<ThreadLayout />}>
            <Route path="/thread/:id/messages" element={<ThreadChat />}/>
            <Route path="/thread/:id/tree" element={<ThreadTree />}/>
          </Route>

          <Route path="/run/:id" element={<RunView />}/>
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
