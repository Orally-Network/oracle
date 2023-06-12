import React from "react";
import { Space, Spin } from "antd";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";

import { SybilPairsProvider } from "Providers/SybilPairs";
import { PythiaDataProvider } from "Providers/PythiaData";
import { GlobalStateProvider } from "Providers/GlobalState";
import Header from "Components/Header";
import Pythia from "Pages/Pythia";
import Sybil from "Pages/Sybil";
import ROUTES from "Constants/routes";
import rollbar from "./rollbar";

const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),
    children: [
      {
        // Default route navigation
        index: true,
        element: <Navigate to={`/${ROUTES.SYBIL}`} replace />,
      },
      {
        path: ROUTES.SYBIL,
        element: <Sybil />,
      },
      {
        path: ROUTES.PYTHIA,
        element: <Pythia />,
      },
    ],
  },
]);

const App = () => {
  return (
    <RollbarProvider instance={rollbar}>
      <ErrorBoundary>
        <GlobalStateProvider>
          <PythiaDataProvider>
            <SybilPairsProvider>
              <RouterProvider
                router={router}
                fallbackElement={
                  <Space size="large">
                    <Spin size="large" />
                  </Space>
                }
              />
            </SybilPairsProvider>
          </PythiaDataProvider>
        </GlobalStateProvider>
      </ErrorBoundary>
    </RollbarProvider>
  );
};

export default App;
