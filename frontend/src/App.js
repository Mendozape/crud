import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//se importa el componente
import ShowResidents from './components/ShowResidents';
//import CreateEmployee from './components/CreateEmployee';
//import EditEmployee from './components/EditEmployee';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <ShowResidents/>} />
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
