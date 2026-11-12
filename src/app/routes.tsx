import { createBrowserRouter } from "react-router";
import { Layout } from "../components/Layout";
import { HomePage } from "../pages/HomePage";
import { ToolPage } from "../pages/ToolPage";
import { InfoPage } from "../pages/InfoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", element: <InfoPage type="about" /> },
      { path: "privacy", element: <InfoPage type="privacy" /> },
      { path: "contact", element: <InfoPage type="contact" /> },
      { path: ":toolId", Component: ToolPage },
    ],
  },
]);
