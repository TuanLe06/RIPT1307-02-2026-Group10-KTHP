import { useState } from 'react';
import { Input } from 'antd';

interface PasswordInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const PasswordInput = ({ value, onChange, placeholder = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="large"
      prefix={<span className="material-symbols-outlined text-outline">lock</span>}
      suffix={
        <span
          className="material-symbols-outlined text-outline cursor-pointer select-none"
          onClick={() => setVisible(!visible)}
        >
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      }
    />
  );
};

export default PasswordInput;
