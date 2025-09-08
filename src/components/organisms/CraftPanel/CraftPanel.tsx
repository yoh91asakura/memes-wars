// CraftPanel - Main crafting interface component
import React, { useState, useEffect } from 'react';
import { useCraftStore } from '../../../stores/craftStore';
import { useCardsStore } from '../../../stores/cardsStore';
import { usePlayerStore } from '../../../stores/playerStore';
import { CraftRecipe } from '../../../services/CraftService';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import './CraftPanel.css';

interface CraftPanelProps {
  className?: string;
  onCraftSuccess?: (recipeName: string) => void;
}

export const CraftPanel: React.FC<CraftPanelProps> = ({
  className = '',
  onCraftSuccess
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('consumable');
  const [showOnlyCraftable, setShowOnlyCraftable] = useState(false);
  
  // Stores
  const {
    availableRecipes,
    selectedRecipe,
    activeItems,
    isCrafting,
    initializeCrafting,
    selectRecipe,
    checkCanCraft,
    performCraft,
    getRecipesByCategory,
    getCraftableRecipes,
    getActiveBoosts
  } = useCraftStore();
  
  const { cards: playerCards } = useCardsStore();
  const { coins: playerGold, gems: playerGems, level: playerLevel } = usePlayerStore();
  
  // Initialize on mount
  useEffect(() => {
    initializeCrafting();
  }, [initializeCrafting]);
  
  // Get recipes for current category
  const categoryRecipes = getRecipesByCategory(selectedCategory);
  const craftableRecipes = getCraftableRecipes(playerCards, playerGold, playerGems, playerLevel);
  const displayRecipes = showOnlyCraftable 
    ? categoryRecipes.filter(recipe => craftableRecipes.some(c => c.id === recipe.id))
    : categoryRecipes;
  
  // Get active boosts
  const activeBoosts = getActiveBoosts();
  
  // Handle recipe selection
  const handleRecipeSelect = (recipeId: string) => {
    selectRecipe(selectedRecipe?.id === recipeId ? null : recipeId);
  };
  
  // Handle crafting
  const handleCraft = async () => {
    if (!selectedRecipe) return;
    
    const result = await performCraft(
      selectedRecipe.id,
      playerCards,
      (gold, gems, cardsUsed) => {
        // This callback would be handled by parent component
        // to actually spend the resources
        console.log(`Spent: ${gold} gold, ${gems} gems, ${cardsUsed.length} cards`);
      }
    );
    
    if (result.success && onCraftSuccess) {
      onCraftSuccess(selectedRecipe.name);
    }
  };
  
  // Check if selected recipe can be crafted
  const canCraftSelected = selectedRecipe 
    ? checkCanCraft(selectedRecipe.id, playerCards, playerGold, playerGems, playerLevel)
    : { canCraft: false };
  
  return (
    <div className={`craft-panel ${className}`}>
      {/* Header */}
      <div className="craft-panel__header">
        <Text variant="h2" weight="bold">
          🛠️ Crafting Workshop
        </Text>
        <Text variant="body" color="muted">
          Combine cards and resources to create powerful items
        </Text>
      </div>
      
      {/* Active Items/Boosts */}
      {activeBoosts.length > 0 && (
        <div className="craft-panel__active-items">
          <Text variant="h4" weight="semibold" className="craft-panel__section-title">
            Active Items
          </Text>
          <div className="craft-panel__active-items-grid">
            {activeBoosts.map((boost, index) => (
              <div key={index} className="craft-panel__active-item">
                <span className="craft-panel__active-item-icon">{boost.icon}</span>
                <div className="craft-panel__active-item-details">
                  <Text variant="caption" weight="medium">{boost.name}</Text>
                  <Text variant="caption" color="muted">
                    {boost.remaining ? `${boost.remaining} uses left` : 'Active'}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Category Selection */}
      <div className="craft-panel__categories">
        {['consumable', 'permanent', 'card'].map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setSelectedCategory(category)}
            className="craft-panel__category-btn"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
      
      {/* Filter Toggle */}
      <div className="craft-panel__filters">
        <label className="craft-panel__filter-toggle">
          <input
            type="checkbox"
            checked={showOnlyCraftable}
            onChange={(e) => setShowOnlyCraftable(e.target.checked)}
          />
          <Text variant="body">Show only craftable</Text>
        </label>
      </div>
      
      {/* Main Content */}
      <div className="craft-panel__content">
        {/* Recipe List */}
        <div className="craft-panel__recipes">
          <Text variant="h4" weight="semibold" className="craft-panel__section-title">
            Recipes ({displayRecipes.length})
          </Text>
          
          <div className="craft-panel__recipe-grid">
            {displayRecipes.map(recipe => {
              const canCraft = checkCanCraft(recipe.id, playerCards, playerGold, playerGems, playerLevel);
              const isSelected = selectedRecipe?.id === recipe.id;
              
              return (
                <div
                  key={recipe.id}
                  className={`craft-panel__recipe-card ${isSelected ? 'selected' : ''} ${!canCraft.canCraft ? 'disabled' : ''}`}
                  onClick={() => handleRecipeSelect(recipe.id)}
                >
                  <div className="craft-panel__recipe-header">
                    <span className="craft-panel__recipe-icon">{recipe.icon}</span>
                    <Badge 
                      variant={recipe.rarity === 'legendary' ? 'warning' : 'info'}
                      size="small"
                    >
                      {recipe.rarity}
                    </Badge>
                  </div>
                  
                  <Text variant="subtitle" weight="medium" className="craft-panel__recipe-name">
                    {recipe.name}
                  </Text>
                  
                  <Text variant="caption" color="muted" className="craft-panel__recipe-description">
                    {recipe.description}
                  </Text>
                  
                  {/* Cost Display */}
                  <div className="craft-panel__recipe-cost">
                    {Object.entries(recipe.cost).map(([resource, amount]) => (
                      <span key={resource} className="craft-panel__cost-item">
                        {amount} {resource}
                      </span>
                    ))}
                  </div>
                  
                  {!canCraft.canCraft && (
                    <Text variant="caption" color="error" className="craft-panel__recipe-error">
                      {canCraft.reason}
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
          
          {displayRecipes.length === 0 && (
            <div className="craft-panel__empty">
              <Text variant="body" color="muted">
                {showOnlyCraftable 
                  ? "No craftable recipes in this category"
                  : "No recipes available in this category"
                }
              </Text>
            </div>
          )}
        </div>
        
        {/* Recipe Details */}
        {selectedRecipe && (
          <div className="craft-panel__recipe-details">
            <Text variant="h4" weight="semibold" className="craft-panel__section-title">
              Recipe Details
            </Text>
            
            <div className="craft-panel__selected-recipe">
              <div className="craft-panel__selected-recipe-header">
                <span className="craft-panel__selected-recipe-icon">
                  {selectedRecipe.icon}
                </span>
                <div>
                  <Text variant="h5" weight="medium">
                    {selectedRecipe.name}
                  </Text>
                  <Badge 
                    variant={selectedRecipe.rarity === 'legendary' ? 'warning' : 'info'}
                    size="small"
                  >
                    {selectedRecipe.rarity}
                  </Badge>
                </div>
              </div>
              
              <Text variant="body" className="craft-panel__selected-recipe-description">
                {selectedRecipe.description}
              </Text>
              
              {/* Detailed Cost */}
              <div className="craft-panel__detailed-cost">
                <Text variant="subtitle" weight="medium">Required:</Text>
                <ul className="craft-panel__cost-list">
                  {Object.entries(selectedRecipe.cost).map(([resource, amount]) => (
                    <li key={resource} className="craft-panel__cost-list-item">
                      <Text variant="body">
                        {amount} {resource.charAt(0).toUpperCase() + resource.slice(1)} cards
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Additional Info */}
              {selectedRecipe.unique && (
                <div className="craft-panel__recipe-info">
                  <Badge variant="warning" size="small">Unique</Badge>
                  <Text variant="caption" color="muted">Can only be crafted once</Text>
                </div>
              )}
              
              {selectedRecipe.cooldown && (
                <div className="craft-panel__recipe-info">
                  <Badge variant="info" size="small">Cooldown</Badge>
                  <Text variant="caption" color="muted">
                    {Math.floor(selectedRecipe.cooldown / (1000 * 60 * 60))}h cooldown
                  </Text>
                </div>
              )}
              
              {selectedRecipe.playerLevelRequired && (
                <div className="craft-panel__recipe-info">
                  <Badge variant="secondary" size="small">Level {selectedRecipe.playerLevelRequired}</Badge>
                  <Text variant="caption" color="muted">Required level</Text>
                </div>
              )}
              
              {/* Craft Button */}
              <div className="craft-panel__craft-action">
                <Button
                  variant="primary"
                  size="large"
                  disabled={!canCraftSelected.canCraft || isCrafting}
                  onClick={handleCraft}
                  className="craft-panel__craft-btn"
                >
                  {isCrafting ? 'Crafting...' : 'Craft Item'}
                </Button>
                
                {!canCraftSelected.canCraft && (
                  <Text variant="caption" color="error">
                    {canCraftSelected.reason}
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};