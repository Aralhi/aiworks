import { Row } from 'antd';
import { MJArgsType } from '.';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

interface IMJTagsProps {
  tags: MJArgsType[];
  onAdd: () => void;
  onRemote: (item: MJArgsType, index: number) => void;
}

function MJTags({ tags, onAdd, onRemote }: IMJTagsProps) {
  return (
    <Row className="mb-1">
      {tags.map((item, index) => {
        return (
          <Row
            key={item.key}
            className="flex items-center justify-center border border-white border-opacity-20 text-[#D4D7DA] rounded text-xs mr-2 overflow-hidden pr-2 mb-2 "
          >
            <span className="flex items-center bg-white bg-opacity-20 text-white pt-1 pb-1 pl-2 pr-2 mr-2">{item.label}</span>
            <span>{Array.isArray(item.value) ? item.value.join(' ') : item.value}</span>
            <CloseOutlined
              rev=""
              className="ml-2 text-[10px] cursor-pointer opacity-30 hover:opacity-100 transition-opacity"
              onClick={() => {
                onRemote(item, index);
              }}
            />
          </Row>
        );
      })}
      <Row
        className="flex items-center justify-center border border-white border-opacity-20 text-[#D4D7DA] text-xs rounded border-dashed cursor-pointer pl-2 mb-2"
        onClick={onAdd}
      >
        <PlusOutlined rev="" className="text-[10px]" />
        <span className="pt-1 pb-1 pl-2 pr-2">参数设置</span>
      </Row>
    </Row>
  );
}

export default MJTags;
