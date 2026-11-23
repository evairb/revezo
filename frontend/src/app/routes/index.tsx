
import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../../feature/dashboard/pages/DashboardPage";
import { ChurchesPage } from "../../feature/churches/church/page/ChurchesPage";
import { MinistriesPage } from "../../feature/ministries/pages/MinistriesPage";
import { ServicesPage } from "../../feature/services/pages/ServicesPage";
import { SchedulesPage } from "../../feature/schedules/pages/SchedulesPage";
import { MainLayout } from "../layouts/MainLayout";
import { LoginPage } from "../../feature/auth/pages/LoginPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { ChurchMembersPage } from "../../feature/churches/members/page/ChurchMembersPage";
import { RegisterPage } from "../../feature/auth/pages/RegisterPage";
import { ChurchMemberDetailsPage } from "../../feature/churches/members/page/ChurchMemberDetailsPage";


export const router = createBrowserRouter([
  // Rotas públicas para visitantes
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage />, },
      { path: "/cadastro", element: <RegisterPage /> },
    ],
  },
  // Rotas protegidas
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage />, },

          { path: "igrejas", element: <ChurchesPage />, },
          { path: "igrejas/:churchId/membros", element: <ChurchMembersPage />, },
          {
            path: "igrejas/:churchId/membros/:memberId",
            element: <ChurchMemberDetailsPage />,
          },

          { path: "ministerios", element: <MinistriesPage />, },
          { path: "cultos", element: <ServicesPage />, },
          { path: "escalas", element: <SchedulesPage />, },
        ]
      }
    ],
  },
]);
