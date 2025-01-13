import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Chat from './Pages/Chat/app';

function App() {
  return (
    <Router>
      <div className="App">
        <h1><Link to="/chat">Chat</Link></h1>
        <Routes>
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
