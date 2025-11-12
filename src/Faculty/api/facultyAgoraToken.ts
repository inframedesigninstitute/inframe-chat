// src/faculty/api/facultyAgoraToken.ts
export const fetchFacultyAgoraToken = async (userId: string): Promise<string | null> => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:5200"}/agora/generate-rtm-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: userId }),
    });

    if (!res.ok) {
      console.error("Token API returned not ok:", res.status);
      return null;
    }

    const data = await res.json();
    // backend returns { status:1, agoraToken: "..." }
    if (data && data.status === 1 && data.agoraToken) return data.agoraToken;
    console.error("Token API error:", data?.msg || data);
    return null;
  } catch (err) {
    console.error("fetchFacultyAgoraToken error:", err);
    return null;
  }
};
