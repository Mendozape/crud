import { BrowserRouter, Routes, Route } from 'react-router-dom';
//se importa el componente
import ShowEmployees from './ShowResidents';
import CreateEmployee from './CreateResidents';
import EditEmployee from './EditResidents';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <ShowEmployees/>} />
          <Route path='/create' element={ <CreateEmployee/>} />
          <Route path='/edit/:id' element={ <EditEmployee/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;