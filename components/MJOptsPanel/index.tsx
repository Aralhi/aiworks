import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { argsOption } from './config';
import { Checkbox, Drawer, Input, InputNumber, Popover, Row, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import MJTags from './MJTags';

type OptType<T = any> = (typeof argsOption)[number] & {
  value?: T;
};

export type MJArgsType<T = any> = Pick<OptType<T>, 'arg' | 'key' | 'label' | 'value'>;

export interface IMJOptsPanelProps {
  onArgsChange: (args: MJArgsType[]) => void;
}

function MJOptsPanel({ onArgsChange }: PropsWithChildren<IMJOptsPanelProps>) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<OptType[]>([...argsOption]);
  const [mjTags, setMJTags] = useState<MJArgsType[]>([]);

  const onCheckBoxChange = useCallback(
    (checked: boolean, index: number) => {
      setOpts((state) => {
        state[index].checked = checked;
        return [...state];
      });
    },
    [opts]
  );

  const onChange = useCallback(
    (value: any, index: number) => {
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

  const handleRemoveTag = (item: MJArgsType, index: number) => {
    setOpts((state) => {
      const index = state.findIndex((opt) => opt.key === item.key);
      console.log(index);
      state[index].checked = false;
      state[index].value = false;
      return [...state];
    });
    setMJTags((state) => {
      state.splice(index, 1);
      return [...state];
    });
  };

  const handleDrawerClose = () => {
    const result: MJArgsType[] = opts
      .filter((item) => item.checked && item.value)
      .map((item) => {
        return {
          arg: item.arg,
          key: item.key,
          value: item.value!,
          label: item.label,
        };
      });
    setMJTags(result);
    onArgsChange(result);
    setOpen(false);
  };

  return (
    <>
      <MJTags
        tags={mjTags}
        onAdd={() => {
          setOpen(true);
        }}
        onRemote={handleRemoveTag}
      />
      <Drawer title="Midjourney生成参数" open={open} onClose={handleDrawerClose}>
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
                {item.type === 'select' && (
                  <Select
                    {...item.selectProps}
                    value={item.value}
                    disabled={!item.checked}
                    allowClear
                    onChange={(val) => {
                      onChange(val, index);
                    }}
                  />
                )}
                {item.type === 'number' && (
                  <InputNumber
                    {...item.inputNumberProps}
                    value={item.value}
                    disabled={!item.checked}
                    onChange={(value) => {
                      onChange(value, index);
                    }}
                  />
                )}
                {item.type === 'input' && (
                  <Input
                    {...item.inputProps}
                    className="h-6 rounded"
                    disabled={!item.checked}
                    value={item.value || ''}
                    placeholder={item.placeholder}
                    onBlur={(e) => {
                      checkStringVal(e.target.value, item, index);
                    }}
                    onChange={(e) => {
                      onChange(e.target.value, index);
                    }}
                  />
                )}
              </Row>
              <Popover placement="topRight" title={false} content={item.tip} trigger="hover">
                <QuestionCircleOutlined rev="" className="ml-2 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
              </Popover>
            </Row>
          );
        })}
      </Drawer>
    </>
  );
}

export default MJOptsPanel;
