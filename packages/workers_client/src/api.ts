export const build_server_url = (endpoint: string) =>
  `${import.meta.env.VITE_SERVER_HOST}${endpoint}`;
