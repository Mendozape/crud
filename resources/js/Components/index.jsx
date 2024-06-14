import { BrowserRouter, Routes, Route } from 'react-router-dom';
//se importa el componente
import ShowResidents from './ShowResidents';
import CreateResidents from './CreateResidents';
import EditResidents from './EditResidents';
import { createRoot } from 'react-dom/client';

export default function ShowEmployees() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/resident' element={ <ShowResidents/>} />
          <Route path='/create' element={ <CreateResidents/>} />
          <Route path='/edit/:id' element={ <EditResidents/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
if (document.getElementById('Residents')) {
  createRoot(document.getElementById('Residents')).render(<ShowEmployees />)
}
