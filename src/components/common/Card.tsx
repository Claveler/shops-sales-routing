import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'lg' }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[`padding-${padding}`]} ${className || ''}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children?: ReactNode;
  actions?: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ children, actions, title, subtitle, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {title ? (
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        ) : children}
      </div>
      {(actions || action) && <div className={styles.headerActions}>{actions || action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  subtitle?: string;
}

export function CardTitle({ children, subtitle }: CardTitleProps) {
  return (
    <div className={styles.titleWrapper}>
      <h2 className={styles.title}>{children}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardBody({ children, padding }: CardBodyProps) {
  const paddingClass = padding ? styles[`body-padding-${padding}`] : '';
  return <div className={`${styles.body} ${paddingClass}`}>{children}</div>;
}
