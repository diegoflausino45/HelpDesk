import styles from "./header.module.css";
import Nav from "../nav/nav";
import { FaPlus, FaUserCircle, FaHeadset } from "react-icons/fa"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Header() {

  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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
          }`}>
        <div className={styles.containerHeader}>

          <Link to={"/chamados/criar"} className={styles.novoChamado}>
            <FaPlus />
            Novo chamado
          </Link>

          <div className={styles.logo}>
            <FaHeadset className={styles.logoIcon} />
            <span>HelpDesk</span>
          </div>

          <div className={styles.user}>
            <FaUserCircle size={22} />
            <span>João Freire</span>
          </div>
        </div>
      </header>
      <Nav />
    </>
  );
}

export default Header;
