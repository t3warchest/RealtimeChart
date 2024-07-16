const { v4: uuidv4 } = require("uuid");
const { client } = require("../connections/redis-connections");

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };
  let existingUser;
  try {
    existingUser = await client.get("patients", existingUser);
  } catch (err) {
    console.log(err);
  }
};

exports.signup = signup;
