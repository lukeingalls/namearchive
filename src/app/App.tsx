import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { NamePage } from './pages/NamePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/n/:name" element={<NamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
