export const build_server_url = (endpoint: string) =>
  `${import.meta.env.__SERVER_HOST__}${endpoint}`;
