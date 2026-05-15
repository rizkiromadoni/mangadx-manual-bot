import readline from 'readline';
import path from "path";
import fs from "fs-extra";
import https from "https";
import http from "http";

const tempDir = path.join(import.meta.dir, "images");

const download = (url: string, filepath: string) => {
  return new Promise((resolve, reject) => {
    const uri = new URL(url);
    const client = uri.protocol == "https:" ? https : http;

    client
      .get(uri, (response) => {
        let data = Buffer.from([]);

        response.on("data", (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
        response.on("end", () => {
          fs.ensureDir(path.dirname(filepath), (err) => {
            if (err) reject(err);
            fs.writeFile(filepath, data).then(() => resolve(filepath));
          });
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

export const downloads = async (
  sources: string[],
  {
    identity,
    title,
    chapter,
  }: {
    identity: string;
    title: string;
    chapter: string;
  }
) => {
  const promises = sources.map((source, key) => {
    const url = new URL(source);
    const filepath = path.join(
      tempDir,
      identity,
      (title[0] as string).toLowerCase(),
      title.toLowerCase().replace(/ /g, "-"),
      chapter.toLowerCase().replace(/ /g, "-"),
      (`${key}.${url.pathname.split(".").pop()}`).toLowerCase().replace(/ /g, "-")
    );

    return download(source, filepath);
  });

  const result = await Promise.all(promises);
  return result;
};

export const ask = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single one
}