const { PrismaClient } = require("@prisma/client");
const { signToken }    = require("../utils/jwt");

const prisma = new PrismaClient();

/*
  Firebase already verified the user on the frontend before calling this.
  We receive the user's name, email and uid directly — find or create
  them in our database and return our own JWT. Simple and works.
*/
const googleLogin = async (req, res) => {
  const { name, email, uid } = req.body;

  if (!email) {
    return res.status(400).json({ message: "No email provided." });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name:     name || email.split("@")[0],
          email,
          password: `google_${uid}`,
          role:     "user",
        },
      });
    }

    const token = signToken({ id: user.id, email: user.email });

    res.json({
      message: "Google sign-in successful.",
      token,
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[googleLogin]", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = { googleLogin };