import styles from "./nav.module.css";
import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaTicketAlt,
  FaUsers,
  FaCog,
} from "react-icons/fa";

function Nav() {
  return (
    <nav className={styles.nav}>
      <NavItem to={"/"} icon={<FaChartBar />} label={"Dashboard"}/>
      <NavItem to={"/chamados"} icon={<FaTicketAlt />} label={"Chamados"}/>
      <NavItem to={"/relatorios"} icon={<FaChartBar />} label={"Relatórios"}/>
      <NavItem to={"/usuarios"} icon={<FaUsers />} label={"Usuários"}/>
      <NavItem to={"/configuracoes"} icon={<FaCog />} label={"Configurações"}/>
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
