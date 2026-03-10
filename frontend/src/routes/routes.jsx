import styles from "./routes.module.css"
//Importação do react-router-dom
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

//Importações de Páginas
import DashBoard from "../containers/dashboard/dashboard"
import Chamados from "../containers/chamados/chamados"
import Relatorios from "../containers/relatorios/relatorios"
import Usuarios from "../containers/usuarios/usuarios"
import Configuracoes from "../containers/configuracoes/configuracoes"
import Perfil from "../containers/perfil/perfil"
import Auth from "../containers/auths/auth"
import NotFound from "../containers/notFound/notFound"
//Importações de Componentes
import Header from "../components/header/header"
import ScrollToTop from "../components/scrollToTop/scrolltoTop"
import { getCurrentUser, getUserPermissions } from "../utils/settings"

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")
  const user = getCurrentUser()

  if (!token || !user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function PermissionRoute({ allow, children }) {
  if (!allow) {
    return <Navigate to="/" replace />
  }
  return children
}

//Componente interno para lógica de renderização
function RouterContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === "/auth"
  const [permissoes, setPermissoes] = useState(() => getUserPermissions())

  useEffect(() => {
    const refreshPermissoes = () => setPermissoes(getUserPermissions())
    window.addEventListener("storage", refreshPermissoes)
    window.addEventListener("config-updated", refreshPermissoes)
    window.addEventListener("user-updated", refreshPermissoes)

    return () => {
      window.removeEventListener("storage", refreshPermissoes)
      window.removeEventListener("config-updated", refreshPermissoes)
      window.removeEventListener("user-updated", refreshPermissoes)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      {!isAuthPage && <ProtectedRoute><Header /></ProtectedRoute>}
      <div className={`${styles.content} ${isAuthPage ? styles.authContent : ""}`}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
          <Route path="/chamados" element={<ProtectedRoute><Chamados /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <PermissionRoute allow={permissoes.canManageUsers}>
                  <Usuarios />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <PermissionRoute allow={permissoes.isAdmin}>
                  <Configuracoes />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

//Definição de Rotas
function RouterApp() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  )
}

export default RouterApp