require("dotenv").config();

const {
  deleteObject,
  getObject,
  objectExists,
  uploadBuffer,
} = require("../services/r2StorageService");

const run = async () => {
  const key = `tests/smart-assist-r2-${Date.now()}.txt`;
  const expected = "Smart Assist R2 connection works";

  console.log("1/5 Uploading test object...");
  await uploadBuffer({
    key,
    buffer: Buffer.from(expected, "utf8"),
    contentType: "text/plain; charset=utf-8",
    metadata: { purpose: "connection-test" },
  });

  console.log("2/5 Checking that the object exists...");
  if (!(await objectExists(key))) {
    throw new Error("R2 upload completed, but HeadObject could not find the object");
  }

  console.log("3/5 Downloading the object...");
  const object = await getObject(key);
  if (!object.Body || typeof object.Body.transformToString !== "function") {
    throw new Error("R2 returned an unsupported response body");
  }

  const received = await object.Body.transformToString();
  if (received !== expected) {
    throw new Error(`Downloaded text did not match. Received: ${received}`);
  }

  console.log("4/5 Deleting the test object...");
  await deleteObject(key);

  console.log("5/5 Confirming deletion...");
  if (await objectExists(key)) {
    throw new Error("The test object still exists after deletion");
  }

  console.log("R2 TEST PASSED: upload, read, existence check, and deletion all work.");
};

run().catch((error) => {
  console.error("R2 TEST FAILED:", error.message);
  if (error.code) console.error("Code:", error.code);
  process.exit(1);
});
