/**
 * useConfiguracoes.jsx (raiz) — Hook de configurações compartilhadas.
 *
 * Observação: existe também uma versão específica em
 * `containers/configuracoes/hooks/useConfiguracoes.jsx`.
 * Este arquivo mantém a API compatível para usos em outros contextos.
 */
import { useState, useEffect, useCallback } from 'react';
import { sectorsAPI } from '../utils/api';

// Regras de validação para campos de configuração
const VALIDACOES = {
  organizacao: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'Nome da organização é obrigatório';
    }
    if (valor.length > 100) {
      return 'Nome da organização não pode ter mais de 100 caracteres';
    }
    return null;
  },
  tentativasLogin: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 1 || num > 10) {
      return 'Tentativas deve estar entre 1 e 10';
    }
    return null;
  },
  validadeSenha: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 0 || num > 365) {
      return 'Validade da senha deve estar entre 0 e 365 dias';
    }
    return null;
  },
  nomeSetor: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'Nome do setor é obrigatório';
    }
    if (valor.length > 50) {
      return 'Nome do setor não pode ter mais de 50 caracteres';
    }
    if (!/^[\w\s\-áéíóúàâôãç]+$/i.test(valor)) {
      return 'Nome do setor contém caracteres inválidos';
    }
    return null;
  },
};

const useConfiguracoes = () => {
  // Estado principal de configurações
  const [configuracoes, setConfiguracoes] = useState({
    geral: {
      organizacao: 'HelpDesk Enterprise',
      idioma: 'pt-BR',
    },
    setores: [],
    usuarios: {
      tecnicosGerenciam: false,
      usuariosEncerram: false,
    },
    notificacoes: {
      emailCriarChamado: true,
      emailAtribuirChamado: false,
    },
    seguranca: {
      tentativasLogin: 5,
      validadeSenha: 90,
    },
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [errosValidacao, setErrosValidacao] = useState({});
  const [alteracoesPendentes, setAlteracoesPendentes] = useState(false);

  // Carregar configurações do backend
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setErrosValidacao({});
      
      // Carregar setores do backend
      const response = await sectorsAPI.getAll();
      const setoresDoBackend = Array.isArray(response.data) 
        ? response.data.map(setor => (typeof setor === 'string' ? setor : setor.name))
        : [];
      
      setConfiguracoes(prev => ({
        ...prev,
        setores: setoresDoBackend,
      }));

      // Carregar outras configurações do localStorage (por enquanto)
      const configSalvas = localStorage.getItem('configuracoes');
      if (configSalvas) {
        try {
          const parsed = JSON.parse(configSalvas);
          setConfiguracoes(prev => ({
            ...prev,
            ...parsed,
            setores: setoresDoBackend, // Sempre usar setores do backend
          }));
        } catch (parseError) {
          console.warn('Erro ao parsear configurações do localStorage:', parseError);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setErro('Erro ao carregar configurações. Usando valores padrão.');
      // Fallback para localStorage
      const configSalvas = localStorage.getItem('configuracoes');
      if (configSalvas) {
        try {
          setConfiguracoes(JSON.parse(configSalvas));
        } catch (e) {
          console.error('Erro ao usar fallback:', e);
        }
      }
    } finally {
      setCarregando(false);
    }
  };

  /** Valida seção e retorna objeto de erros por campo. */
  const validar = useCallback((secao, dados) => {
    const erros = {};

    if (secao === 'geral') {
      if (dados.organizacao) {
        const erro = VALIDACOES.organizacao(dados.organizacao);
        if (erro) erros.organizacao = erro;
      }
    }

    if (secao === 'seguranca') {
      if (dados.tentativasLogin) {
        const erro = VALIDACOES.tentativasLogin(dados.tentativasLogin);
        if (erro) erros.tentativasLogin = erro;
      }
      if (dados.validadeSenha !== undefined) {
        const erro = VALIDACOES.validadeSenha(dados.validadeSenha);
        if (erro) erros.validadeSenha = erro;
      }
    }

    return erros;
  }, []);

  /** Atualiza seção no estado após validação local. */
  const atualizarConfiguracao = useCallback((secao, dados) => {
    const erros = validar(secao, dados);
    
    if (Object.keys(erros).length > 0) {
      setErrosValidacao(prev => ({ ...prev, [secao]: erros }));
      return false;
    }

    setErrosValidacao(prev => {
      const novo = { ...prev };
      delete novo[secao];
      return novo;
    });

    setConfiguracoes(prev => ({
      ...prev,
      [secao]: {
        ...prev[secao],
        ...dados,
      },
    }));
    setAlteracoesPendentes(true);
    return true;
  }, [validar]);

  /** Adiciona setor no backend e sincroniza no estado local. */
  const adicionarSetor = useCallback(async (nomeSetor) => {
    const erroValidacao = VALIDACOES.nomeSetor(nomeSetor);
    if (erroValidacao) {
      throw new Error(erroValidacao);
    }

    if (configuracoes.setores.includes(nomeSetor.trim())) {
      throw new Error('Setor já existe');
    }

    try {
      const response = await sectorsAPI.create({ name: nomeSetor.trim() });
      const novoSetor = typeof response.data === 'string' ? response.data : response.data.name;
      
      setConfiguracoes(prev => ({
        ...prev,
        setores: [...prev.setores, novoSetor],
      }));
      setAlteracoesPendentes(true);
      return response.data;
    } catch (err) {
      const mensagem = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Erro ao adicionar setor';
      throw new Error(mensagem);
    }
  }, [configuracoes.setores]);

  /** Remove setor no estado local (aguardando endpoint dedicado no backend). */
  const removerSetor = useCallback(async (nomeSetor) => {
    if (configuracoes.setores.length <= 1) {
      throw new Error('Você deve ter pelo menos um setor');
    }

    // TODO: Implementar delete no backend quando endpoints forem criados
    setConfiguracoes(prev => ({
      ...prev,
      setores: prev.setores.filter(s => s !== nomeSetor),
    }));
    setAlteracoesPendentes(true);
  }, [configuracoes.setores.length]);

  /** Valida seções e persiste em localStorage. */
  const salvarConfiguracoes = useCallback(async () => {
    try {
      setCarregando(true);
      
      // Validar todas as seções antes de salvar
      const errosGeral = validar('geral', configuracoes.geral);
      const errosSeguranca = validar('seguranca', configuracoes.seguranca);
      
      if (Object.keys(errosGeral).length > 0 || Object.keys(errosSeguranca).length > 0) {
        const todosErros = { ...errosGeral, ...errosSeguranca };
        setErrosValidacao(todosErros);
        throw new Error('Corrija os erros de validação');
      }

      // Salvar em localStorage por enquanto
      localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
      setAlteracoesPendentes(false);
      setErro(null);
      return { sucesso: true, mensagem: 'Configurações salvas com sucesso' };
    } catch (err) {
      const mensagem = err.message || 'Erro ao salvar configurações';
      setErro(mensagem);
      throw new Error(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [configuracoes, validar]);

  /** Descarta alterações e recarrega configuração persistida. */
  const cancelarAlteracoes = useCallback(() => {
    carregarConfiguracoes();
    setAlteracoesPendentes(false);
    setErrosValidacao({});
  }, []);

  return {
    configuracoes,
    carregando,
    erro,
    errosValidacao,
    alteracoesPendentes,
    atualizar: atualizarConfiguracao,
    adicionarSetor,
    removerSetor,
    salvar: salvarConfiguracoes,
    cancelar: cancelarAlteracoes,
    recarregar: carregarConfiguracoes,
  };
};

export default useConfiguracoes;
