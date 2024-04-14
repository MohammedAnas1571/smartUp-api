import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import sharp from "sharp";

const bucket = process.env.BUCKET;
const region = process.env.REGION;
const awsKey = process.env.AWS_KEY;
const secretPassword = process.env.AWS_PASSWORD;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsKey,
    secretAccessKey: secretPassword,
  },
  region: region,
});

export const imageStore = async (file, imageName) => {
    const buffer = await sharp(file.buffer)
      .resize({ height: 500, width: 500, fit: "contain" })
      .toBuffer();
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: imageName,
        Body:buffer,
        ContentType: file.mimetype 
    })
    const fileLink = `https://${bucket}.s3.${region}.amazonaws.com/${imageName}`
     await s3.send(command)
    return   fileLink 
}


