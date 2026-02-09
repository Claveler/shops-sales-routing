import type { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ breadcrumbItems, title, subtitle, actions, children }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
