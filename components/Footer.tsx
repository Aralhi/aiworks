import { Popover } from "antd";
import { Douyin, RedBook, WX } from "./SVG";

export default function Footer() {
  return (
    <footer className=" pt-10 pb-10 flex flex-col justify-center items-center gap-2" style={{ backgroundColor: '#212930', color: '#6c7d8f' }}>
      <div className="flex justify-center items-center">
        <span className="mr-6">联系我们:</span>
        <Popover content={<img className="md:w-[200px] md:h-[300px]" src='./douyin.JPG' />}>
          <a className="cursor-pointer mr-6">
            <Douyin />
          </a>
        </Popover>
        <Popover content={<img className="md:w-[200px] md:h-[300px]" src='./rebbook.jpg' />}>
          <a className="cursor-pointer mr-6">
            <RedBook />
          </a>
        </Popover>
        <Popover content={<img className="md:w-[200px] md:h-[300px]" src='./weixin_service.JPG' />}>
          <a className="cursor-pointer">
            <WX />
          </a>
        </Popover>
      </div>
      <div className="container mx-auto flex flex-wrap justify-between">
        <div className="w-full text-center text-base">
          <p>&copy; 2023 AI works. All rights reserved. <span>粤ICP备2023052587号-1</span></p>
        </div>
      </div>
    </footer>
  );
}
