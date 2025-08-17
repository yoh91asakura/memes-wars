import React, { useState } from 'react';
import { CardShowcase } from '../components/test/CardShowcase';

const TestCards: React.FC = () => {
  const [mode, setMode] = useState<'display' | 'combat' | 'collection'>('display');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <div>
      {/* Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        color: 'white'
      }}>
        <h3>🎛️ Contrôles</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Mode:</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as any)}
            style={{ padding: '5px', borderRadius: '5px' }}
          >
            <option value="display">Display</option>
            <option value="combat">Combat</option>
            <option value="collection">Collection</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Taille:</label>
          <select 
            value={size} 
            onChange={(e) => setSize(e.target.value as any)}
            style={{ padding: '5px', borderRadius: '5px' }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
          <p>📱 Testez les différents modes et tailles</p>
          <p>🎯 Vérifiez que tout le contenu est visible</p>
          <p>✨ Observez les animations par rareté</p>
        </div>
      </div>

      {/* Showcase */}
      <CardShowcase mode={mode} size={size} />
    </div>
  );
};

export default TestCards;