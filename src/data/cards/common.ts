import { UnifiedCard } from '../../models/unified/Card';
import { commonUnifiedCards } from './common-unified';

// Re-export unified cards as the main export
export const commonCards: UnifiedCard[] = commonUnifiedCards;

// Legacy export for backward compatibility
export { commonUnifiedCards };
