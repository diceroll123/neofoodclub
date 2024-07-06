const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const { BUCKET_NAME } = process.env;

module.exports = async (req, res) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `current_round.txt`,
    };
    const data = await s3.getObject(params).promise();
    let round = data.Body.toString("utf-8");

    res.setHeader("Cache-Control", "public, max-age=5");

    res.status(200).send(round);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
