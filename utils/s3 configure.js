import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
  const image = sharp(file.buffer);
  const metadata = await image.metadata();
  let buffer;
  if (metadata.format === "jpeg") {
    buffer = await image
      .resize({ height: 580, width: 924, })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  }
  if (metadata.format === "png") {
    buffer = await image
      .resize({ height: 580, width: 924,  })
      .png({ progressive: true })
      .toBuffer();
  }
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: imageName,
    Body: buffer,
    ContentType: file.mimetype,
  });
  const fileLink = `https://${bucket}.s3.${region}.amazonaws.com/${imageName}`;
  await s3.send(command);
  return fileLink;
};
export const videoStore = async (file, videoName) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: videoName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  const videoLink = `https://${bucket}.s3.${region}.amazonaws.com/${videoName}`;

  await s3.send(command);

  return videoLink;
};
