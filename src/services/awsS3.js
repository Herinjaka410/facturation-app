import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
  }
});

export const listFiles = async (bucket) => {
  const command = new ListObjectsV2Command({ Bucket: bucket });
  const response = await s3Client.send(command);
  return response.Contents || [];
};

export const getFile = async (bucket, key) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);
  return await response.Body.transformToString();
};
