/**
 * themeToggle.jsx — Alternador de tema claro/escuro.
 *
 * Estratégia:
 *   - Persiste escolha em localStorage ('theme')
 *   - Adiciona/remove classe `dark` no elemento <html>
 *   - Força refresh de variáveis CSS removendo/reaplicando transition rapidamente
 */
import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import styles from "./themeToggle.module.css";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Inicializa com o valor salvo
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    
    // Sino não houver salvo, comece com light mode
    return false;
  });

  // Aplica o tema ao montar e quando isDark muda
  useEffect(() => {
    const html = document.documentElement;
    
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    // Force-refresh das variáveis CSS
    // Isso é um hack mas garante que o navegador aplique as mudanças
    html.style.transition = "none";
    setTimeout(() => {
      html.style.transition = "";
    }, 0);
    
  }, [isDark]);

  const handleToggle = (e) => {
    e.preventDefault();
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <button
      className={styles.themeToggle}
      onClick={handleToggle}
      type="button"
      aria-label="Alternar tema"
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <FaSun className={styles.icon} /> : <FaMoon className={styles.icon} />}
    </button>
  );
}

export default ThemeToggle;
