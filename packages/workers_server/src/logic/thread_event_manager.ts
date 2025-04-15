import { logger } from "@src/logger";
import cuid from "cuid";

type Event = {
  type: string;
  data: any;
};

type EventListener = (event: Event) => void;
const event_listeners: Record<string, Record<string, EventListener>> = {};

const broadcast = (thread_id: string, event: Event) => {
  logger.info("broadcasting event", thread_id, event);

  if (thread_id in event_listeners) {
    const thread_listeners = event_listeners[thread_id];
    for (const event_listener of Object.values(thread_listeners)) {
      event_listener(event);
    }
  }
};

const subscribe = (
  thread_id: string,
  subscription_id: string,
  event_listener: EventListener
) => {
  if (!(thread_id in event_listeners)) {
    event_listeners[thread_id] = {};
  }

  event_listeners[thread_id][subscription_id] = event_listener;
};

const unsubscribe = (thread_id: string, subscription_id: string) => {
  delete event_listeners[thread_id][subscription_id];
};

// SSE stream interface
type SSEStream = {
  subscription_id: string;
  stream: ReadableStream;
};
const make_sse_stream = (thread_id: string): SSEStream => {
  const subscription_id = cuid();

  const stream = new ReadableStream({
    start: controller => {
      const event_listener: EventListener = (event: Event) => {
        controller.enqueue(`event: ${event.type}\n`);
        controller.enqueue(`data: ${JSON.stringify(event.data)}\n\n`);
      };

      subscribe(thread_id, subscription_id, event_listener);
    },
    cancel: () => {
      unsubscribe(thread_id, subscription_id);
    },
  });

  return {
    subscription_id,
    stream,
  };
};

const delete_sse_stream = (
  thread_id: string,
  subscription_id: string
): void => {
  unsubscribe(thread_id, subscription_id);
};

export const thread_event_manager = {
  sse: {
    make_sse_stream,
    delete_sse_stream,
  },
  broadcast,
};
