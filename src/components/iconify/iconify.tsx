import { Icon, type IconProps } from '@iconify/react';
import { cn } from '@/utils/themeMerger';
import { forwardRef } from 'react';

interface IconifyProps extends IconProps {
  icon: string;
}

const Iconify = forwardRef<SVGSVGElement, IconifyProps>(
  ({ icon, className, ...other }, ref) => (
    <Icon
      ref={ref}
      icon={icon}
      className={cn('inline-flex', className)}
      {...other}
    />
  ),
  );

Iconify.displayName = 'Iconify';

export default Iconify;
