import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout'; // We will create this
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Placeholder page components
const Home = () => <h1 className="text-2xl">Strona Główna (Placeholder)</h1>;
const Substitutions = () => <h1 className="text-2xl">Zastępstwa (Placeholder)</h1>;
const Calendar = () => <h1 className="text-2xl">Kalendarz (Placeholder)</h1>;
const Events = () => <h1 className="text-2xl">Wydarzenia (Placeholder)</h1>;
const Announcements = () => <h1 className="text-2xl">Ogłoszenia (Placeholder)</h1>;
const News = () => <h1 className="text-2xl">Aktualności (Placeholder)</h1>;
const SubmitSubstitutions = () => <h1 className="text-2xl">Prześlij Zastępstwa (Placeholder)</h1>;
const NowPlaying = () => <h1 className="text-2xl">Teraz Odtwarzane (Placeholder)</h1>;
const AdminPortal = () => <h1 className="text-2xl">Portal Administratora (Placeholder)</h1>;
const AccountSettings = () => <h1 className="text-2xl">Ustawienia Konta (Placeholder)</h1>;
const ESignature = () => <h1 className="text-2xl">E-Podpis (Placeholder)</h1>;
const Forms = () => <h1 className="text-2xl">Formularze (Placeholder)</h1>;
const StudentCouncil = () => <h1 className="text-2xl">Samorząd Uczniowski (Placeholder)</h1>;
const Login = () => <h1 className="text-2xl">Logowanie (TischnerID - Placeholder)</h1>; // Placeholder for TischnerID login

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap routes with AuthProvider */}
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="substitutions" element={<Substitutions />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="events" element={<Events />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="news" element={<News />} />
            <Route path="submit-substitutions" element={<SubmitSubstitutions />} /> {/* Protected */}
            <Route path="now-playing" element={<NowPlaying />} />
            <Route path="admin" element={<AdminPortal />} /> {/* Protected */}
            <Route path="account-settings" element={<AccountSettings />} /> {/* Protected */}
            <Route path="e-signature" element={<ESignature />} /> {/* Protected */}
            <Route path="forms" element={<Forms />} />
            <Route path="student-council" element={<StudentCouncil />} />
            <Route path="login" element={<Login />} />
            {/* Add other routes here */}
            <Route path="*" element={<h1 className="text-2xl">404 - Nie znaleziono strony</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
