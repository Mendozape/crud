import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
//se importa el componente
import ShowFees from './ShowFees';
import CreateFees from './CreateFees';
import EditFees from './EditFees';

import { MessageProvider } from './MessageContext';


export default function FeesApp() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/fees' element={ <ShowFees/>} />
          <Route path='/create' element={ <CreateFees/>} />
          <Route path='/edit/:id' element={ <EditFees/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
if (document.getElementById('Fees')) {
  createRoot(document.getElementById('Fees')).render(
    <MessageProvider>
      <FeesApp />
    </MessageProvider>,
  )
}
