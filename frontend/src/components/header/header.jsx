/**
 * header.jsx — Cabeçalho fixo da aplicação.
 *
 * Comportamento:
 *   - Oculta ao rolar para baixo > 80px (classe styles.hide)
 *   - Reaparece ao rolar para cima (classe styles.show)
 *   - Contém: botão "Novo chamado", logo, NotificationCenter, ThemeToggle e UserMenu
 *   - Renderiza Nav logo abaixo e o modal CriarChamadoModal de forma global
 */
import styles from "./header.module.css";
import Nav from "../nav/nav";
import { FaPlus, FaHeadset } from "react-icons/fa"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserMenu from "./components/userMenu";
import ThemeToggle from "../themeToggle/themeToggle";
import CriarChamadoModal from "../../containers/chamados/components/criarChamado/criarChamadoModal";
import NotificationCenter from "../NotificationCenter/notificationCenter";

function Header() {

  // Controla visibilidade do header baseada na direção do scroll
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)  // posição anterior do scroll
  const [openCreate, setOpenCreate] = useState(false) // exibe modal de criar chamado

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY

      // Oculta quando rola para baixo além do threshold de 80px
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowHeader(false)
      } else {
        // Exibe ao rolar para cima ou quando scroll está próximo do topo
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

          <div className={styles.headerActions}>
            <NotificationCenter />
            <ThemeToggle />
            <UserMenu />
          </div>
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
