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
      <NavLink to="/" className={styles.link}>
        <FaChartBar /> Dashboard
      </NavLink>

      <NavLink to="/chamados" className={styles.link}>
        <FaTicketAlt /> Chamados
      </NavLink>

      <NavLink to="/relatorios" className={styles.link}>
        <FaChartBar /> Relatórios
      </NavLink>

      <NavLink to="/usuarios" className={styles.link}>
        <FaUsers /> Usuários
      </NavLink>

      <NavLink to="/configuracoes" className={styles.link}>
        <FaCog /> Configurações
      </NavLink>
    </nav>
  );
}

export default Nav;
