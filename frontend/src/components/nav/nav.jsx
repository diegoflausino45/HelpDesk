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
