"use strict";

const { OK } = require("../core/success.response");

const dataProfiles = [
    { id: 1, name: "John Doe", age: 30 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: 3, name: "Alice Johnson", age: 28 },
    { id: 4, name: "Bob Brown", age: 35 },
    { id: 5, name: "Charlie White", age: 22 },
];

// Helper function to get a random profile
function getRandomProfile() {
    const randomIndex = Math.floor(Math.random() * dataProfiles.length);
    return dataProfiles[randomIndex];
}

class ProfileController {
  profiles = async (req, res) => {
    new OK({
      message: "Get all profiles successfully",
      metadata: dataProfiles,
    }).send(res);
  };

  profile = async (req, res) => {
    new OK({
      message: "Get profile successfully",
      metadata: getRandomProfile(),
    }).send(res);
  };
}

module.exports = new ProfileController();
