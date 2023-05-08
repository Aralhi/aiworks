import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV === "development") {
    const stringData = `Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!
    Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!`;
    const stream = new Readable({
      read() {
        this.push(stringData);
        this.push(null);
      },
    }); // 创建可读流对象并写入数据

    stream.on('data', (chunk) => {
      res.write(chunk)
    })

    stream.on('end', () => {
      res.end()
    })
  }
}
