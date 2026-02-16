import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { NamePage } from './pages/NamePage';
import { AboutPage } from './pages/AboutPage';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/n/:name" element={<NamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
