"use strict";

const mongoose = require("mongoose");
const connectionString = "mongodb://localhost:27017/testdb"; // Adjust the connection string as needed

const TestSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
});
const TestModel = mongoose.model("Test", TestSchema);

describe("MongoDB Connection", () => {
  let connection;
  beforeAll(async () => {
    connection = await mongoose.connect(connectionString);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should connect to Mongoose", async () => {
    expect(connection).toBeDefined();
    expect(connection.connection.readyState).toBe(1); // 1 means connected
  });

  it("should create and save a test document", async () => {
    const testDoc = new TestModel({
      name: "John Doe",
      age: 30,
      email: "abc@gmail.com",
    });
    const savedDoc = await testDoc.save();
    expect(savedDoc._id).toBeDefined();
    expect(savedDoc.name).toBe("John Doe");
    expect(savedDoc.age).toBe(30);
    expect(savedDoc.email).toBe("abc@gmail.com");
  });

  it("should retrieve the test document", async () => {
    const retrievedDoc = await TestModel.findOne({ name: "John Doe" });
    expect(retrievedDoc).toBeDefined();
    expect(retrievedDoc.name).toBe("John Doe");
    expect(retrievedDoc.age).toBe(30);
    expect(retrievedDoc.email).toBe("abc@gmail.com");
  });
});
