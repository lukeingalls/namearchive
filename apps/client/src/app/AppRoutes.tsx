import { Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NamePage } from './pages/NamePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/n/:name" element={<NamePage />} />
      </Route>
    </Routes>
  );
}
