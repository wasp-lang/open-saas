import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

export default function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  const { children, ...rest } = props;
  return <button {...rest}>{children}</button>;
}
