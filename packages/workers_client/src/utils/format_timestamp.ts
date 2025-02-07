export const format_timestamp = (timestamp: string | null) => {
  if(!timestamp) return null;
  
  const date = timestamp.split("T")[0];
  const time = timestamp.split("T")[1].replace("Z", "").split(":").slice(0, 2).join(":");
  return `${date} ${time}`;
}
