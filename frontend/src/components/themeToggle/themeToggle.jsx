import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import styles from "./themeToggle.module.css";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Inicializa com o valor salvo
    const saved = localStorage.getItem("theme");
    if (saved) {
      console.log("✅ Tema carregado do localStorage:", saved);
      return saved === "dark";
    }
    
    // Sino não houver salvo, comece com light mode
    console.log("📝 Nenhum tema salvo, iniciando com LIGHT");
    return false;
  });

  // Aplica o tema ao montar e quando isDark muda
  useEffect(() => {
    const html = document.documentElement;
    console.log("🎨 Aplicando tema:", isDark ? "DARK ✨" : "LIGHT ☀️");
    console.log("Classes antes:", html.className);
    
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    console.log("Classes depois:", html.className);
    
    // Force-refresh das variáveis CSS
    // Isso é um hack mas garante que o navegador aplique as mudanças
    html.style.transition = "none";
    setTimeout(() => {
      html.style.transition = "";
    }, 0);
    
  }, [isDark]);

  const handleToggle = (e) => {
    e.preventDefault();
    console.log("🔘 Botão clicado!");
    const newIsDark = !isDark;
    console.log("Novo tema será:", newIsDark ? "DARK ✨" : "LIGHT ☀️");
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
