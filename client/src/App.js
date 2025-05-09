import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Results from "./pages/Results"
import RootLayout from "./pages/RootLayout"
import ErrorPage from "./pages/ErrorPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Elections from "./pages/Elections"
import ElectionDetails from "./pages/ElectionDetails"
import Candidates from "./pages/Candidates"
import Congrats from "./pages/Congrats"
import Logout from "./pages/Logout"
import Voting from "./pages/Voting"
import Thankyou from "./pages/Thankyou";
import Voteridpage from "./pages/Voterid";

const router = createBrowserRouter([
  {
    path:'/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Login/>
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "results",
        element: <Results />
      },
      {
        path: "elections",
        element: <Elections />
      },
      {
        path: "voting",
        element: <Voting />
      },
      {
        path: "elections/:id",
        element: <ElectionDetails />
      },
      {
        path: "elections/:id/candidates",
        element: <Candidates />
      },
      {
        path: "congrats",
        element: <Congrats />
      },
      {
        path: "thankyou",
        element: <Thankyou />
      },
      {
      path: "voteridpage",
      element: <Voteridpage />
      },
      {
        path: "Logout",
        element: <Logout />
      },
    ]
  }
])








function App() {
  return (<RouterProvider router={router} />);
}

export default App;
