import jsonServer from "json-server";
import jwt from "jsonwebtoken";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const SECRET_KEY = "123456789";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

server.use(middlewares);
server.use(jsonServer.bodyParser);

const createToken = (payload, expiry) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: expiry });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
};

server.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = router.db.get("users").find({ username, password }).value();

  if (user) {
    const accessToken = createToken({ username }, ACCESS_TOKEN_EXPIRY);
    const refreshToken = createToken({ username }, REFRESH_TOKEN_EXPIRY);
    res.status(200).json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

server.post("/auth/refresh", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const newAccessToken = createToken(
      { username: decoded.username },
      ACCESS_TOKEN_EXPIRY
    );
    const newRefreshToken = createToken(
      { username: decoded.username },
      REFRESH_TOKEN_EXPIRY
    );
    res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Middleware for token verification
server.use((req, res, next) => {
  if (req.path !== "/auth/login" && req.path !== "/auth/refresh") {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const verified = verifyToken(token);
      if (verified) {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized - Invalid token" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized - Token missing" });
    }
  } else {
    next();
  }
});

// CRUD routes for personaldata
server.get("/personaldata", (req, res) => {
  const personalData = router.db.get("personaldata").value();
  res.status(200).json(personalData);
});

server.get("/personaldata/:id", (req, res) => {
  const personalData = router.db
    .get("personaldata")
    .find({ id: Number(req.params.id) })
    .value();
  if (personalData) {
    res.status(200).json(personalData);
  } else {
    res.status(404).json({ message: "Data not found" });
  }
});

server.post("/personaldata", (req, res) => {
  const newPersonalData = req.body;
  router.db.get("personaldata").push(newPersonalData).write();
  res.status(201).json(newPersonalData);
});

server.put("/personaldata/:id", (req, res) => {
  const updatedPersonalData = req.body;
  const personalData = router.db
    .get("personaldata")
    .find({ id: Number(req.params.id) })
    .assign(updatedPersonalData)
    .write();
  res.status(200).json(personalData);
});

server.delete("/personaldata/:id", (req, res) => {
  router.db
    .get("personaldata")
    .remove({ id: Number(req.params.id) })
    .write();
  res.status(204).end();
});
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});
