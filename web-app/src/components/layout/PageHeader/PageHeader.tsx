import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface PageHeaderTab {
  id: string;
  label: string;
  onClick: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tabs?: PageHeaderTab[];
  activeTab?: string;
  breadcrumbs?: ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={clsx('bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800', className)}>
      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="mb-4">
            {breadcrumbs}
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 truncate"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-1 text-sm md:text-base text-neutral-600 dark:text-neutral-400"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6 -mb-px"
          >
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={tab.onClick}
                    className={clsx(
                      'relative px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200',
                      'whitespace-nowrap',
                      {
                        'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20':
                          isActive,
                        'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800':
                          !isActive,
                      }
                    )}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';

export default PageHeader;
