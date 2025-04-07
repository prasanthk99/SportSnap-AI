import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = 'videos') => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType
  };

  const data = await s3.upload(params).promise();
  return data.Location;
};