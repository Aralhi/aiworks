import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { argsOption } from './config';
import { Checkbox, Drawer, Input, Popover, Row } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

type SelectArray = (typeof argsOption)[number][];

export interface IMJOptsPanelProps {
  open: boolean;
  onChange: (config: SelectArray) => void;
  onClose: () => void;
}

type OptType = (typeof argsOption)[number] & {
  value?: string;
};

function MJOptsPanel({ open, onClose, onChange }: PropsWithChildren<IMJOptsPanelProps>) {
  const [opts, setOpts] = useState<OptType[]>([...argsOption]);

  const onCheckBoxChange = useCallback(
    (checked: boolean, index: number) => {
      setOpts((state) => {
        state[index].checked = checked;
        return [...state];
      });
    },
    [opts]
  );

  const onChangeArgVal = useCallback(
    (value: string, index: number) => {
      setOpts((state) => {
        state[index].value = value;
        return [...state];
      });
    },
    [opts]
  );

  const checkStringVal = (value: string, item: OptType, index: number) => {
    if (value === '' || value === undefined) return;
    if (item.rule && !item.rule.test(value)) {
      setOpts((state) => {
        state[index].value = '';
        return [...state];
      });
    }
  };

  useEffect(() => {
    onChange(opts.filter((item) => item.checked));
  }, [opts]);

  return (
    <Drawer title="Midjourney生成参数" open={open} onClose={onClose}>
      {opts.map((item, index) => {
        return (
          <Row key={item.key} className="align-middle mb-4">
            <Row className="w-32">
              <Checkbox
                checked={item.checked}
                onChange={(e) => {
                  onCheckBoxChange(e.target.checked, index);
                }}
              >
                {item.label}
              </Checkbox>
            </Row>
            <Row className="flex-1 flex-col">
              <Input
                className="h-6 rounded"
                defaultValue={item.default}
                disabled={!item.checked}
                value={item.value}
                placeholder={item.placeholder}
                onBlur={(e) => {
                  checkStringVal(e.target.value, item, index);
                }}
                onChange={(e) => {
                  onChangeArgVal(e.target.value, index);
                }}
              />
            </Row>
            <Popover placement="topRight" title={false} content={item.tip} trigger="hover">
              <QuestionCircleOutlined rev="" className="ml-2 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
            </Popover>
          </Row>
        );
      })}
    </Drawer>
  );
}

export default MJOptsPanel;
