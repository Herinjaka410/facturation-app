// s3Config.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
  signatureVersion: 'v4' // Important pour les URLs signées
});

export default s3;