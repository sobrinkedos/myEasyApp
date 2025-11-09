import React, { ReactNode } from 'react';
import clsx from 'clsx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, size = 'xl', className }) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <div className={clsx('mx-auto px-4 md:px-6', sizeClasses[size], className)}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export default Container;
