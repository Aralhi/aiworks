import { Row } from 'antd';

interface ITagsProps {
  data: string[];
  onItemClick: (item: string) => void;
}

function Tags({ data, onItemClick }: ITagsProps) {
  return (
    <Row className="align-middle text-white text-lg">
      {data.map((item) => {
        return (
          <Row
            key={item}
            className="mr-2 mt-2 items-center justify-center w-16 h-9 rounded bg-white transition-all bg-opacity-[.14] cursor-pointer hover:bg-opacity-25 tracking-wider"
            onClick={() => {
              onItemClick(item);
            }}
          >
            {item}
          </Row>
        );
      })}
    </Row>
  );
}

export default Tags;
