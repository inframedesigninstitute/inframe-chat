// src/faculty/api/messages.ts
export const fetchChatHistory = async (channelId: string, limit = 50) => {
  const res = await fetch(`${process.env.BACKEND_URL}/messages/${channelId}?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
};

export const postMessageToDB = async (payload: any) => {
  await fetch(`${process.env.BACKEND_URL}/messages`, {
    method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
  });
};
