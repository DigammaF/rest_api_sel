import express from "express";
const app = express();
const port = "3000";

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("Response sent");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
export type MemberProfile = 'admin' | 'utilisateur';

export interface AuthSession {
  code_membre: string;
  profil: MemberProfile;
  token: string;
  expiresAt: number;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
    }
  }
}

export {};
