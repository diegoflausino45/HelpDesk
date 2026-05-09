/**
 * routes.jsx — Configuração central de roteamento da aplicação.
 *
 * Estrutura:
 *   RouterApp        → provedor BrowserRouter
 *   RouterContent    → lógica de layout (Header, ScrollToTop) + definição de rotas
 *   ProtectedRoute   → redireciona para /auth se não houver sessão ativa
 *   PermissionRoute  → redireciona para / se a permissão for insuficiente
 */
import styles from "./routes.module.css"
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

// Páginas / containers da aplicação
import DashBoard from "../containers/dashboard/dashboard"
import Chamados from "../containers/chamados/chamados"
import Relatorios from "../containers/relatorios/relatorios"
import Usuarios from "../containers/usuarios/usuarios"
import Configuracoes from "../containers/configuracoes/configuracoes"
import Perfil from "../containers/perfil/perfil"
import Auth from "../containers/auths/auth"
import NotFound from "../containers/notFound/notFound"

// Componentes de infraestrutura de UI
import Header from "../components/header/header"
import ScrollToTop from "../components/scrollToTop/scrollToTop"
import { getCurrentUser, getUserPermissions } from "../utils/settings"

/**
 * Guarda de autenticação: exige token JWT + objeto de usuário no localStorage.
 * Caso ausentes, redireciona para /auth sem renderizar o filho.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")
  const user = getCurrentUser()

  if (!token || !user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

/**
 * Guarda de permissão: recebe `allow` (booleano derivado de getUserPermissions).
 * Se falso, redireciona para a raiz em vez de exibir a página.
 */
function PermissionRoute({ allow, children }) {
  if (!allow) {
    return <Navigate to="/" replace />
  }
  return children
}

/**
 * Conteúdo do roteador — precisa estar dentro de BrowserRouter para
 * usar useLocation. Renderiza Header em todas as rotas exceto /auth.
 */
function RouterContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === "/auth"

  // Permissões do usuário; atualizadas via eventos customizados para evitar
  // re-render em toda a árvore ao mudar configurações
  const [permissoes, setPermissoes] = useState(() => getUserPermissions())

  useEffect(() => {
    // Ouve mudanças no localStorage (outra aba) e eventos internos
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