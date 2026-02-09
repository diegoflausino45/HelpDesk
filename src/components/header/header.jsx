import styles from "./header.module.css";
import Nav from "../nav/nav";
import { FaPlus, FaUserCircle } from "react-icons/fa"

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.containerHeader}>

        <button className={styles.novoChamado}>
          <FaPlus />
          Novo chamado
        </button>

        <div className={styles.logo}>HelpDesk</div>

        <div className={styles.user}>
          <FaUserCircle size={22} />
          <span>João Freire</span>
        </div>
      </div>
        <Nav />
    </header>
  );
}

export default Header;
