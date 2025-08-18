import React from 'react';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import './Navigation.css';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

interface NavigationProps {
  items: NavigationItem[];
  variant?: 'horizontal' | 'vertical';
  className?: string;
  testId?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  variant = 'horizontal',
  className = '',
  testId,
}) => {
  return (
    <nav 
      className={`navigation navigation--${variant} ${className}`.trim()}
      data-testid={testId}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navigation__container">
        {items.map((item) => (
          <div key={item.id} className="navigation__item">
            <Button
              variant={item.active ? 'primary' : 'ghost'}
              className={`navigation__button ${item.active ? 'navigation__button--active' : ''}`.trim()}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              <Icon name={item.icon} size="sm" />
              <Text variant="body" color="inherit" weight={item.active ? 'semibold' : 'normal'}>
                {item.label}
              </Text>
              {item.badge && (
                <Badge size="sm" variant="danger" rounded>
                  {item.badge}
                </Badge>
              )}
            </Button>
          </div>
        ))}
      </div>
    </nav>
  );
};
