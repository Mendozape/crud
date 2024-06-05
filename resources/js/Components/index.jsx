import * as React from "react";
import * as ReactDOM from "react-dom/client";
import ShowResidents from './ShowResidents';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
const notis = createBrowserRouter([
  {
    path: '/residentx',
    element: <ShowResidents />,
  },

]);

ReactDOM.createRoot(document.getElementById("Residentx")).render(
  <React.StrictMode>
    <RouterProvider router={notis} />
  </React.StrictMode>
);

