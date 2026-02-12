import styles from "./header.module.css";
import Nav from "../nav/nav";
import { FaPlus, FaHeadset } from "react-icons/fa"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserMenu from "./components/userMenu";
import CriarChamadoModal from "../../containers/chamados/components/criarChamado/criarChamadoModal";

function Header() {

  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [openCreate, setOpenCreate] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // rolando pra baixo
        setShowHeader(false)
      } else {
        // rolando pra cima
        setShowHeader(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])


  return (
    <>
    
      <header className={`${styles.header} ${
            showHeader ? styles.show : styles.hide
          }`} >
        <div className={styles.containerHeader}>

          <Link to={"/chamados"} className={styles.novoChamado} onClick={() => setOpenCreate(true)}>
            <FaPlus />
            Novo chamado
          </Link>

          <div className={styles.logo}>
            <FaHeadset className={styles.logoIcon} />
            <span>HelpDesk</span>
          </div>

          <UserMenu/>
        </div>
      </header>
      <Nav />

            <CriarChamadoModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
        />
    </>
  );
}

export default Header;
