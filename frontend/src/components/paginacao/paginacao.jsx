/**
 * paginacao.jsx — Componente de paginação genérico.
 *
 * Props:
 *   totalItems   {number} — total de itens na lista (antes de fatiar)
 *   itemsPerPage {number} — quantos itens por página
 *   currentPage  {number} — página ativa (1-based)
 *   onPageChange {fn}     — callback chamado com o novo número de página
 *
 * Retorna null automaticamente quando há apenas 1 página (sem renderização desnecessária).
 */
import styles from "./paginacao.module.css"

function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Não renderiza o componente de paginação quando há apenas uma página
  if (totalPages <= 1) return null

  return (
    <div className={styles.pagination}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1
        return (
          <button
            key={page}
            className={currentPage === page ? styles.active : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próximo
      </button>
    </div>
  )
}

export default Pagination
