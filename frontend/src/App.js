import React from 'react';
import { Routes, Route } from 'react-router-dom'; // REMOVED BrowserRouter import
import Navigation from './components/navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Schools from './pages/Schools';
import Elearning from './pages/Elearning';
import Kiosk from './pages/Kiosk';
import Contact from './pages/Contact';
import Science from './pages/Schools/Science';
import Computers from './pages/Schools/Computers';
import Automotive from './pages/Schools/Automotive';
import Entertainment from './pages/Schools/Entertainment';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/elearning" element={<Elearning />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/schools/science" element={<Science />} />
          <Route path="/schools/computers" element={<Computers />} />
          <Route path="/schools/automotive" element={<Automotive />} />
          <Route path="/schools/entertainment" element={<Entertainment />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;