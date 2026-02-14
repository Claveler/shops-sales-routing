import type { ReactNode } from 'react';
import styles from './Table.module.css';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${className || ''}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeadProps {
  children: ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
  return <thead className={styles.thead}>{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className={styles.tbody}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className }: TableRowProps) {
  return (
    <tr 
      className={`${styles.row} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children?: ReactNode;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export function TableCell({ children, header, align = 'left', width }: TableCellProps) {
  const Component = header ? 'th' : 'td';
  return (
    <Component 
      className={`${styles.cell} ${styles[align]}`}
      style={width ? { width } : undefined}
    >
      {children}
    </Component>
  );
}
