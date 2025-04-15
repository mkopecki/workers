import { archive_thread } from "./thread/archive_thread";
import { create_message } from "./thread/create_message";
import { create_thread } from "./thread/create_thread";
import { delete_thread } from "./thread/delete_thread";
import { get_thread_event_stream } from "./thread/get_thread_event_stream";
import { get_threads } from "./thread/get_threads";
import { update_thread } from "./thread/update_thread";
import { create_run } from "./run/create_run";
import { get_workers } from "./workers/get_workers";
import { get_user } from "./auth/get_user";
import { create_user_session } from "./auth/create_user_session";
import { create_user } from "./auth/create_user";
import { get_thread } from "./thread/get_thread";

export const client_routes = {
  threads: {
    archive_thread,
    delete_thread,
    update_thread,
    create_thread,

    create_message,

    get_threads,

    get_thread,
    get_thread_event_stream,
  },

  runs: {
    create_run,
  },

  workers: {
    get_workers,
  },

  auth: {
    get_user,
    create_user_session,
    create_user,
  },
};
