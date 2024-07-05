const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const { BUCKET_NAME } = process.env;

module.exports = async (req, res) => {
  const { round } = req.query;
  if (!round) {
    return res.status(400).json({ error: "Round parameter is required" });
  }

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `rounds/${round}.json`,
    };
    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString("utf-8"));

    res.setHeader("Cache-Control", "public, max-age=10");

    res.status(200).json(jsonData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
