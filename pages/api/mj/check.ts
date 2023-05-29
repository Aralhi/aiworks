import { encrypt } from "@/lib/crypto";
import { sessionOptions } from "@/lib/session";
import { FINGERPRINT_KEY } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { UserSession } from "../user/user";
import { checkQueryCount } from "@/lib/mjMessage";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.session.user as UserSession;
  const fingerprint = req.headers[FINGERPRINT_KEY] as string;

  const { status, message } = await checkQueryCount(
    user as UserSession,
    fingerprint
  );

  if (status !== "ok") {
    return res.status(200).json({ status, message });
  }

  const plaintext = user?._id || fingerprint;
  const auth = encrypt(plaintext);

  res.setHeader("Authorization", `Bearer ${auth}`);

  return res.json({
    status: "ok",
    data: { plaintext },
  });
};

export default withIronSessionApiRoute(handler, sessionOptions);
