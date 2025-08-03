import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-lg p-6',
        hover && 'glass-hover',
        className
      )}
    >
      {children}
    </div>
  );
}