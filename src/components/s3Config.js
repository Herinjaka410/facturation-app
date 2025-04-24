// s3Config.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: 'http://localhost:9000',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  // Ajoutez ces configurations supplémentaires
  maxRetries: 3,
  httpOptions: { timeout: 60000 }
});

export default s3;