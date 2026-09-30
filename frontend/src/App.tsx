import { BrowserRouter } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </BrowserRouter>
  );
}
