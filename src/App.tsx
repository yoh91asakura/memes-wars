import { useState } from 'react';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { RollPage } from './components/pages/RollPage/RollPage';
import { CollectionPage } from './components/pages/CollectionPage/CollectionPage';
import { CombatPage } from './components/pages/CombatPage/CombatPage';
// import { CardDebug } from './components/molecules/Card/CardDebug';
import './App.css';

type Page = 'roll' | 'collection' | 'battle';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('roll');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'roll':
        return <RollPage testId="roll-page" />;
      case 'collection':
        return <CollectionPage testId="collection-page" />;
      case 'battle':
        return <CombatPage />;
      // case 'debug':
        // return <CardDebug />;
      default:
        return <RollPage testId="roll-page" />;
    }
  };

  return (
    <MainLayout 
      currentPage={currentPage}
      onNavigate={handleNavigate}
      testId="main-app"
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;
