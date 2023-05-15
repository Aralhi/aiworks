import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV === "development") {
    const stringData = '以下是使用JavaScript编写的一些常见数组排序算法示例：\n\n1. 冒泡排序\n\n冒泡排序是一种简单的排序算法，它重复地遍历要排序的列表，比较相邻的元素并交换它们的位置，直到整个列表都是按升序排列的。\n\n```javascript\nfunction bubbleSort(arr) {\n  var len = arr.length;\n  for (var i = 0; i < len - 1; i++) {\n    for (var j = 0; j < len - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        var temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}\n```\n\n2.'
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
