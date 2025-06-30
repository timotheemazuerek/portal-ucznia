import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-200">Strona Główna</Link></li>
            <li><Link to="/substitutions" className="hover:text-blue-200">Zastępstwa</Link></li>
            <li><Link to="/calendar" className="hover:text-blue-200">Kalendarz</Link></li>
            <li><Link to="/events" className="hover:text-blue-200">Wydarzenia</Link></li>
            <li><Link to="/announcements" className="hover:text-blue-200">Ogłoszenia</Link></li>
            <li><Link to="/news" className="hover:text-blue-200">Aktualności</Link></li>
            {/* Add more common links here. User-specific links might go into a different component or conditional rendering */}
            <li className="ml-auto"><Link to="/login" className="hover:text-blue-200">Login (TischnerID)</Link></li>
            <li><Link to="/account-settings" className="hover:text-blue-200">Ustawienia Konta</Link></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8">
        <Outlet /> {/* This is where the routed components will be rendered */}
      </main>

      <footer className="bg-gray-700 text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} Portal Ucznia Zespołu Szkół Tischnera. Wszelkie prawa zastrzeżone.</p>
        {/* <p>Kontakt: <a href="mailto:sekretariat@tischner.pl" className="hover:underline">sekretariat@tischner.pl</a></p> */}
      </footer>
    </div>
  );
};

export default Layout;
