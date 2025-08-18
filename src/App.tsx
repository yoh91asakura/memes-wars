import { useState } from 'react';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { RollPage } from './components/pages/RollPage/RollPage';
import { Text } from './components/atoms';
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
        return (
          <div className="page-placeholder">
            <Text variant="h3" color="inherit" align="center">
              📦 Card Collection
            </Text>
            <Text variant="body" color="muted" align="center">
              View and manage your collected cards (Coming Soon)
            </Text>
          </div>
        );
      case 'battle':
        return (
          <div className="page-placeholder">
            <Text variant="h3" color="inherit" align="center">
              ⚔️ Battle Arena
            </Text>
            <Text variant="body" color="muted" align="center">
              Epic meme card battles await! (Coming Soon)
            </Text>
          </div>
        );
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
