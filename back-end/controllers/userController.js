import { collections } from "../config/db.js";
import { sendServerEvent } from "../utils/facebookCAPI.js"; // ADD THIS

export const getUser = async (req, res) => {
  const { email } = req.params;
  // Only the account owner or an admin may read a full user record (PII)
  if (email !== req.user?.email && req.user?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden access" });
  }
  const user = await collections.users.findOne({ email });
  res.send(user);
  // no pixel — just a data fetch
};

export const getUserRole = async (req, res) => {
  const user = await collections.users.findOne({ email: req.params.email });
  res.send({ role: user?.role || "user" });
  // no pixel — internal role check only
};

export const createUser = async (req, res) => {
  const user = req.body;

  const existing = await collections.users.findOne({ email: user.email });

  if (existing) {
    if (!existing.name && user.name) {
      await collections.users.updateOne(
        { email: user.email },
        { $set: { name: user.name } }
      );
    }

    // PIXEL: Login — user already exists so this is a returning user signing in
    await sendServerEvent('Login', req);

    return res.send({ message: "User already exists", user: existing });
  }

  const result = await collections.users.insertOne({
    name: user.name,
    email: user.email,
    role: "user", // never trust a client-supplied role — promotion happens only via the admin route
    createdAt: new Date(),
  });

  // PIXEL: CompleteRegistration — brand new user created
  await sendServerEvent('CompleteRegistration', req);

  res.send(result);
};

export const updateUser = async (req, res) => {
  const { email } = req.params;
  // verifyFBToken sets req.user.email (there is no req.decoded_email)
  if (email !== req.user?.email && req.user?.role !== "admin")
    return res.status(403).send({ message: "Forbidden access" });

  // Whitelist editable fields — never allow self-promotion via role/email/_id.
  // `shippingAddress` is a structured object { name, phone, address, district,
  // thana } used to auto-fill checkout.
  const ALLOWED = ["name", "phone", "photo", "photoURL", "address", "shippingAddress"];
  const updates = { updatedAt: new Date() };
  for (const key of ALLOWED) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const result = await collections.users.updateOne(
    { email },
    { $set: updates }
  );

  // PIXEL: custom — user updated their profile
  await sendServerEvent('CustomEvent_ProfileUpdated', req);

  res.send(result);
};