/**
 * nav.jsx — Barra de navegação lateral/inferior.
 *
 * Renderiza os links de navegação disponíveis conforme as permissões do usuário:
 *   - Dashboard e Chamados: visíveis para todos os autenticados
 *   - Usuários: requer canManageUsers (admin ou técnico com flag habilitada)
 *   - Configurações: requer isAdmin
 *
 * Permissões são atualizadas via eventos customizados para evitar re-render global.
 */
import styles from "./nav.module.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaChartBar,
  FaTicketAlt,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { getUserPermissions } from "../../utils/settings";

function Nav() {
  // Permissões inicializadas de forma lazy para não bloquear a primeira renderização
  const [permissoes, setPermissoes] = useState(() => getUserPermissions())

  useEffect(() => {
    // Recalcula permissões quando config ou usuário mudam (suporte a multi-aba)
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

  // Aliases semânticos para facilitar a leitura do JSX abaixo
  const canAccessUsers = permissoes.canManageUsers
  const canAccessSettings = permissoes.isAdmin

  return (
    <nav className={styles.nav}>
      <NavItem to={"/"} icon={<FaChartBar />} label={"Dashboard"}/>
      <NavItem to={"/chamados"} icon={<FaTicketAlt />} label={"Chamados"}/>
      <NavItem to={"/relatorios"} icon={<FaChartBar />} label={"Relatórios"}/>
      {canAccessUsers && <NavItem to={"/usuarios"} icon={<FaUsers />} label={"Usuários"}/>} 
      {canAccessSettings && <NavItem to={"/configuracoes"} icon={<FaCog />} label={"Configurações"}/>} 
    </nav>
  );
}

function NavItem({to, icon, label}){
    return(
        <NavLink to={to} className={({isActive}) =>
                `${styles.link} ${isActive ? styles.active : ""}`
            }>
            {icon}{label}
        </NavLink>
    )
}

export default Nav;
