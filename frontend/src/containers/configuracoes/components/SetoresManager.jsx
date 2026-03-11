/**
 * SetoresManager.jsx — CRUD local de setores no painel de configurações.
 *
 * Funcionalidades:
 *   - adicionar setor com validação
 *   - editar nome do setor com confirmação
 *   - remover setor com confirmação e regra de mínimo de 1 setor
 */
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaExclamation } from 'react-icons/fa';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmDialog from '../../../components/Modal/confirmDialog';
import styles from '../configuracoes.module.css';

const SetoresManager = ({ setores, onAdicionarSetor, onRemoverSetor, onEditarSetor, carregando }) => {
  // Estados de formulário e fluxo de edição/remoção
  const [novoSetor, setNovoSetor] = useState('');
  const [editandoSetor, setEditandoSetor] = useState(null);
  const [setorEditado, setSetorEditado] = useState('');
  const [adicionandoSetor, setAdicionandoSetor] = useState(false);
  const [editandoSetorId, setEditandoSetorId] = useState(false);
  const [setorParaRemover, setSetorParaRemover] = useState(null);
  const [mostrarModalRemover, setMostrarModalRemover] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [removendoSetor, setRemovendoSetor] = useState(false);
  const { addToast } = useToast();

  // Validações para novo setor (nome, caracteres e duplicidade)
  const validarNovoSetor = (valor) => {
    if (!valor.trim()) return { valido: false, mensagem: '' };
    if (valor.length > 50) return { valido: false, mensagem: 'Máximo de 50 caracteres' };
    if (!/^[a-zA-Z0-9\s\-áéíóúàâãäèêëìîïòôõöùûüçñ]+$/i.test(valor)) {
      return { valido: false, mensagem: 'Apenas letras, números e hífen' };
    }
    if (setores.includes(valor.trim())) {
      return { valido: false, mensagem: 'Setor já existe' };
    }
    return { valido: true, mensagem: '' };
  };

  const validacaoNovoSetor = validarNovoSetor(novoSetor);
  const temErroNovoSetor = novoSetor.trim().length > 0 && !validacaoNovoSetor.valido;

  const handleAdicionarSetor = async () => {
    try {
      setAdicionandoSetor(true);
      await onAdicionarSetor(novoSetor);
      setNovoSetor('');
      addToast('Setor adicionado com sucesso', 'sucesso');
    } catch (erro) {
      addToast(erro.message || 'Erro ao adicionar setor', 'erro');
    } finally {
      setAdicionandoSetor(false);
    }
  };

  const handleRemoverSetor = async (setor) => {
    setSetorParaRemover(setor);
    setMostrarModalRemover(true);
  };

  const confirmarRemocao = async () => {
    try {
      setRemovendoSetor(true);
      await onRemoverSetor(setorParaRemover);
      addToast(`Setor "${setorParaRemover}" removido com sucesso`, 'sucesso');
      setMostrarModalRemover(false);
      setSetorParaRemover(null);
    } catch (erro) {
      addToast(erro.message || 'Erro ao remover setor', 'erro');
    } finally {
      setRemovendoSetor(false);
    }
  };

  const iniciarEdicao = (setor) => {
    setEditandoSetor(setor);
    setSetorEditado(setor);
  };

  const confirmarEdicao = () => {
    setMostrarModalEditar(true);
  };

  const handleSalvarEdicao = async () => {
    if (!setorEditado.trim()) {
      addToast('Nome do setor não pode estar vazio', 'aviso');
      return;
    }

    try {
      setEditandoSetorId(true);
      await onEditarSetor(editandoSetor, setorEditado);
      setEditandoSetor(null);
      setSetorEditado('');
      setMostrarModalEditar(false);
      addToast('Setor editado com sucesso', 'sucesso');
    } catch (erro) {
      addToast(erro.message || 'Erro ao editar setor', 'erro');
    } finally {
      setEditandoSetorId(false);
    }
  };

  const cancelarEdicao = () => {
    setEditandoSetor(null);
    setSetorEditado('');
    setMostrarModalEditar(false);
  };

  return (
    <div className={styles.setoresContainer}>
      <div className={styles.adicionarSetor}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Nome do novo setor"
            value={novoSetor}
            onChange={(e) => setNovoSetor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdicionarSetor()}
            disabled={adicionandoSetor || carregando}
            maxLength="50"
            title="Digite o nome do setor (máx. 50 caracteres)"
            className={`${
              temErroNovoSetor ? styles.inputError : 
              novoSetor.trim().length > 0 ? styles.inputSuccess : ''
            }`}
          />
          {novoSetor.trim().length > 0 && (
            <span className={`${styles.validationIcon} ${
              temErroNovoSetor ? styles.validationIconError : styles.validationIconSuccess
            }`}>
              {temErroNovoSetor ? <FaTimes /> : <FaCheck />}
            </span>
          )}
          {temErroNovoSetor && (
            <p className={styles.validationMessage}>
              <FaExclamation /> {validacaoNovoSetor.mensagem}
            </p>
          )}
        </div>
        <button
          onClick={handleAdicionarSetor}
          className={styles.addBtn}
          disabled={!novoSetor.trim() || !validacaoNovoSetor.valido || adicionandoSetor || carregando}
          title={novoSetor.trim() ? 'Adicionar novo setor' : 'Preencha o nome do setor'}
        >
          <FaPlus /> {adicionandoSetor ? 'Adicionando...' : 'Adicionar'}
        </button>
      </div>

      <div className={styles.setoresList}>
        <h3>Setores Cadastrados ({setores.length})</h3>
        {carregando ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Carregando setores...
          </p>
        ) : setores.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Nenhum setor cadastrado. Crie o primeiro adicionando um nome acima.
          </p>
        ) : (
          setores.map((setor) => (
            <div key={setor} className={styles.setorItem}>
              {editandoSetor === setor ? (
                <div className={styles.editContainer}>
                  <input
                    type="text"
                    value={setorEditado}
                    onChange={(e) => setSetorEditado(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && confirmarEdicao()}
                    autoFocus
                    maxLength="50"
                    disabled={editandoSetorId}
                    className={`${
                      setorEditado.trim() === editandoSetor ? '' :
                      setorEditado.trim().length > 0 && !setores.includes(setorEditado.trim()) ? styles.inputSuccess :
                      setorEditado.trim().length > 0 ? styles.inputError : ''
                    }`}
                  />
                  {setorEditado.trim() !== editandoSetor && setorEditado.trim().length > 0 && (
                    <span className={`${styles.validationIcon} ${
                      setores.includes(setorEditado.trim()) ? styles.validationIconError : styles.validationIconSuccess
                    }`}>
                      {setores.includes(setorEditado.trim()) ? <FaTimes /> : <FaCheck />}
                    </span>
                  )}
                  <button 
                    onClick={confirmarEdicao} 
                    className={styles.saveBtn}
                    disabled={setorEditado.trim() === editandoSetor || setorEditado.trim().length === 0 || setores.includes(setorEditado.trim()) || editandoSetorId || carregando}
                    title="Salvar alterações"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={cancelarEdicao}
                    className={styles.cancelBtn}
                    title="Cancelar edição"
                    disabled={editandoSetorId}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className={styles.setorDisplay}>
                  <span>{setor}</span>
                  <div className={styles.setorActions}>
                    <button
                      onClick={() => iniciarEdicao(setor)}
                      className={styles.editBtn}
                      disabled={carregando || editandoSetorId}
                      title="Editar setor"
                      aria-label={`Editar setor ${setor}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleRemoverSetor(setor)}
                      className={styles.deleteBtn}
                      disabled={setores.length <= 1 || carregando || editandoSetorId}
                      title={setores.length <= 1 ? 'Você deve manter pelo menos um setor' : 'Remover setor'}
                      aria-label={`Remover setor ${setor}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={mostrarModalRemover}
        onClose={() => {
          setMostrarModalRemover(false);
          setSetorParaRemover(null);
        }}
        onConfirm={confirmarRemocao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover o setor "${setorParaRemover}"? Esta ação não pode ser desfeita e todos os chamados associados a este setor precisarão ser remanejados.`}
        confirmText="Sim, remover"
        cancelText="Cancelar"
        variant="delete"
        isLoading={removendoSetor}
      />

      {/* Modal de confirmação de edição */}
      <ConfirmDialog
        isOpen={mostrarModalEditar}
        onClose={() => setMostrarModalEditar(false)}
        onConfirm={handleSalvarEdicao}
        title="Confirmar Edição"
        message={`Deseja alterar o nome do setor de "${editandoSetor}" para "${setorEditado}"? Todos os chamados associados ao setor anterior serão automaticamente atualizados.`}
        confirmText="Sim, editar"
        cancelText="Cancelar"
        variant="edit"
        isLoading={editandoSetorId}
      />
    </div>
  );
};

export default SetoresManager;
