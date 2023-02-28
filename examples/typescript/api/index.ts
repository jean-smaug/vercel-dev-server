import { VercelRequest, VercelResponse } from "@vercel/node";

export default function (req: VercelRequest, res: VercelResponse) {
  res.send("Salut, je m'appelle Jean Smaug");
}
