import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import fs from "fs-extra"
import path from "path"

interface StorageOptions {
   storageUrl: string
   accessKey: string
   secretKey: string
   bucket: string
   region: string
   endpoint: string
   root?: string
}

export default class Storage {
  private s3Client: S3Client
  private root: string
  private bucket: string
  private storageUrl: string

  constructor(options: StorageOptions) {
    this.s3Client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      credentials: {
        accessKeyId: options.accessKey,
        secretAccessKey: options.secretKey,
      },
    })

    this.storageUrl = options.storageUrl
    this.bucket = options.bucket
    this.root = options.root ?? ""
  }

  async uploads(images: any[], dir: string = ""): Promise<string[]> {
    const promises = images.map((image) => this.upload(image, dir));

    const result = await Promise.all(promises);
    return Promise.resolve(result.map((path) => `${path}`))
  }

  async upload(image: any, dir: string = ""): Promise<string> {
    const fileName = path.basename(image)
    const filestream = await fs.readFile(image)

    const params = {
      Bucket: this.bucket,
      Key: path.join(this.root, dir, fileName),
      Body: filestream,
      ACL: "public-read",
      ContentType: "image/jpeg",
      ContentEncoding: "base64",
    }

    try {
      const response = await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: path.join(this.root, dir, fileName),
        Body: filestream,
        ACL: "public-read",
        ContentType: "image/jpeg",
        ContentEncoding: "base64",
      }))

      if (response.$metadata.httpStatusCode === 200) {
        return Promise.resolve(`${this.storageUrl}/${params.Key}`)
      }

      return Promise.reject(`[STORAGE] ${response.$metadata.httpStatusCode}`)
    } catch (error) {
      return Promise.reject(`[STORAGE] ${error}`)
    }

  }
}
