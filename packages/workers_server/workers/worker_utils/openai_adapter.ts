export const server_format_transform = new TransformStream({
  transform: (chunk, controller) => {
    const sse = JSON.parse(chunk);
    const delta = sse.choices[0]?.delta?.content;
    if (delta) {
      controller.enqueue(delta);
    }
  },
});
