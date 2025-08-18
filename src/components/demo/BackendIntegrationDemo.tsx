/**
 * Composant de démo pour tester l'intégration avec le backend
 * Affiche les vraies cartes du backend et permet de tester les fonctionnalités
 */

import React, { useState } from 'react';
import { useCards, useCardRoll, useCardStats } from '../../hooks/useCards';
import { CardRarity } from '../../types/Card';
import './BackendIntegrationDemo.css';

const BackendIntegrationDemo: React.FC = () => {
  const [selectedPackType, setSelectedPackType] = useState('basic');
  const [rollCount, setRollCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks pour gérer les données
  const {
    cards,
    pagination,
    loading: cardsLoading,
    error: cardsError,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
    searchCards,
  } = useCards({ limit: 6 });

  const { roll, rolling, lastRoll, error: rollError } = useCardRoll();
  const { stats, loading: statsLoading } = useCardStats();

  // Gestion du roll de cartes
  const handleRoll = async () => {
    try {
      await roll(selectedPackType, rollCount);
    } catch (err) {
      console.error('Roll failed:', err);
    }
  };

  // Gestion de la recherche
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await searchCards(searchQuery);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  // Gestion des filtres de rareté
  const handleRarityFilter = (rarity: CardRarity | undefined) => {
    setFilters({ rarity });
  };

  return (
    <div className="backend-demo">
      <div className="demo-header">
        <h2>🎮 Backend Integration Demo</h2>
        <p>Testez la connexion avec le backend Meme Wars !</p>
      </div>

      {/* Statistiques globales */}
      <div className="stats-section">
        <h3>📊 Statistiques des Cartes</h3>
        {statsLoading ? (
          <div className="loading">Chargement des stats...</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Total:</strong> {stats.total} cartes
            </div>
            <div className="stat-item">
              <strong>Common:</strong> {stats.byRarity.COMMON || 0}
            </div>
            <div className="stat-item">
              <strong>Uncommon:</strong> {stats.byRarity.UNCOMMON || 0}
            </div>
            <div className="stat-item">
              <strong>Rare:</strong> {stats.byRarity.RARE || 0}
            </div>
            <div className="stat-item">
              <strong>Epic:</strong> {stats.byRarity.EPIC || 0}
            </div>
            <div className="stat-item">
              <strong>Legendary:</strong> {stats.byRarity.LEGENDARY || 0}
            </div>
            <div className="stat-item">
              <strong>Mythic:</strong> {stats.byRarity.MYTHIC || 0}
            </div>
          </div>
        ) : (
          <div className="error">Erreur de chargement des stats</div>
        )}
      </div>

      {/* Section Roll */}
      <div className="roll-section">
        <h3>🎲 Test du Roll System</h3>
        <div className="roll-controls">
          <div className="control-group">
            <label>Type de Pack:</label>
            <select 
              value={selectedPackType} 
              onChange={(e) => setSelectedPackType(e.target.value)}
              disabled={rolling}
            >
              <option value="basic">Basic Pack</option>
              <option value="premium">Premium Pack (1.5x)</option>
              <option value="legendary">Legendary Pack (2x)</option>
              <option value="cosmic">Cosmic Pack (3x)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Nombre de cartes:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rollCount}
              onChange={(e) => setRollCount(parseInt(e.target.value) || 1)}
              disabled={rolling}
            />
          </div>

          <button 
            onClick={handleRoll} 
            disabled={rolling}
            className="roll-button"
          >
            {rolling ? '🎰 Rolling...' : '🎲 Roll Cards!'}
          </button>
        </div>

        {rollError && <div className="error">Erreur: {rollError}</div>}

        {/* Résultat du dernier roll */}
        {lastRoll && (
          <div className="roll-result">
            <h4>🎉 Dernier Roll ({lastRoll.packType}):</h4>
            <div className="roll-info">
              <span>💰 Valeur: {lastRoll.totalValue} points</span>
              {lastRoll.bonusMultiplier && (
                <span>✨ Bonus: {lastRoll.bonusMultiplier}x</span>
              )}
            </div>
            <div className="rolled-cards">
              {lastRoll.cards.map((card, index) => (
                <div key={index} className={`rolled-card rarity-${card.rarity?.toLowerCase()}`}>
                  <div className="card-emoji">{card.emoji}</div>
                  <div className="card-name">{card.name}</div>
                  <div className="card-rarity">{card.rarity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Recherche */}
      <div className="search-section">
        <h3>🔍 Recherche de Cartes</h3>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Rechercher des cartes... (ex: meme, doge, shrek)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            🔍 Rechercher
          </button>
        </div>
      </div>

      {/* Filtres de rareté */}
      <div className="filters-section">
        <h3>🎯 Filtres</h3>
        <div className="filter-buttons">
          <button onClick={() => handleRarityFilter(undefined)} className="filter-btn">
            Toutes
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.COMMON)} className="filter-btn rarity-common">
            Common
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.UNCOMMON)} className="filter-btn rarity-uncommon">
            Uncommon
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.RARE)} className="filter-btn rarity-rare">
            Rare
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.EPIC)} className="filter-btn rarity-epic">
            Epic
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.LEGENDARY)} className="filter-btn rarity-legendary">
            Legendary
          </button>
          <button onClick={() => handleRarityFilter(CardRarity.MYTHIC)} className="filter-btn rarity-mythic">
            Mythic
          </button>
          <button onClick={clearFilters} className="clear-filters-btn">
            ❌ Effacer
          </button>
        </div>
      </div>

      {/* Liste des cartes */}
      <div className="cards-section">
        <h3>🎴 Cartes du Backend</h3>
        
        {cardsError && <div className="error">Erreur: {cardsError}</div>}
        
        {cardsLoading ? (
          <div className="loading">Chargement des cartes...</div>
        ) : (
          <>
            {/* Pagination info */}
            {pagination && (
              <div className="pagination-info">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} cartes)
              </div>
            )}

            {/* Grille des cartes */}
            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.id} className={`demo-card rarity-${card.rarity?.toLowerCase()}`}>
                  <div className="card-header">
                    <span className="card-emoji">{card.emoji}</span>
                    <span className="card-cost">{card.cost}⚡</span>
                  </div>
                  <div className="card-name">{card.name}</div>
                  <div className="card-description">{card.description}</div>
                  <div className="card-stats">
                    <span>⚔️ {card.attack}</span>
                    <span>🛡️ {card.defense}</span>
                    <span>❤️ {card.health}</span>
                  </div>
                  <div className="card-rarity">{card.rarity}</div>
                  {card.flavor && <div className="card-flavor">&ldquo;{card.flavor}&rdquo;</div>}
                </div>
              ))}
            </div>

            {/* Contrôles de pagination */}
            {pagination && (
              <div className="pagination-controls">
                <button 
                  onClick={prevPage} 
                  disabled={!pagination.hasPrev}
                  className="pagination-btn"
                >
                  ⬅️ Précédent
                </button>
                <span className="page-info">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button 
                  onClick={nextPage} 
                  disabled={!pagination.hasNext}
                  className="pagination-btn"
                >
                  Suivant ➡️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BackendIntegrationDemo;
