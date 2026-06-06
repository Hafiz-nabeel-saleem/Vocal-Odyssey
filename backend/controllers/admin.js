const User = require("../models/user");

const getUsers = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" }).select(
      "-password"
    );
    res.json(supervisors);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to retrieve supervisors. Please try again later." });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOneAndDelete({ _id: id, role: "supervisor" });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete user. Please try again later." });
  }
};

module.exports = { getUsers, deleteUser };
