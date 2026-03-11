/**
 * useConfiguracoes.jsx — Hook central para estado e persistência de configurações.
 *
 * Responsabilidades:
 *   - carregar configurações (setores via API + demais campos via localStorage)
 *   - validar alterações por seção
 *   - expor ações de atualizar/salvar/cancelar
 *   - gerenciar CRUD de setores no estado
 */
import { useState, useEffect, useCallback } from 'react';
import { sectorsAPI } from '../../../utils/api';

// Regras de validação por campo/seção
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
  tamanhoMinimoSenha: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 6 || num > 32) {
      return 'Tamanho mínimo da senha deve estar entre 6 e 32 caracteres';
    }
    return null;
  },
  tempoBloqueioMinutos: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 5 || num > 1440) {
      return 'Tempo de bloqueio deve estar entre 5 e 1440 minutos';
    }
    return null;
  },
  limiteSessaoMinutos: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 15 || num > 1440) {
      return 'Tempo de sessão deve estar entre 15 e 1440 minutos';
    }
    return null;
  },
  maxUsuariosAtivos: (valor) => {
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 1 || num > 5000) {
      return 'Limite de usuários ativos deve estar entre 1 e 5000';
    }
    return null;
  },
  remetenteEmail: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'Email remetente é obrigatório';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor.trim())) {
      return 'Email remetente inválido';
    }
    return null;
  },
  horarioSilencioso: (inicio, fim) => {
    if (!inicio || !fim) {
      return 'Defina início e fim do horário silencioso';
    }
    if (inicio === fim) {
      return 'Horários de início e fim não podem ser iguais';
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
  // Baseline usado quando não há configuração salva
  const configuracoesPadrao = {
    geral: {
      organizacao: 'HelpDesk Enterprise',
      idioma: 'pt-BR',
    },
    setores: [],
    usuarios: {
      tecnicosGerenciam: false,
      usuariosEncerram: false,
      permitirConviteUsuarios: true,
      autoAprovarNovosUsuarios: false,
      papelPadraoNovoUsuario: 'user',
      limiteSessaoMinutos: 120,
      maxUsuariosAtivos: 500,
    },
    notificacoes: {
      emailCriarChamado: true,
      emailAtribuirChamado: true,
      emailAlteracaoStatus: true,
      notificarComentario: true,
      notificarSLA: true,
      receberResumoDiario: false,
      canalPadrao: 'email',
      frequenciaResumo: 'diario',
      remetenteEmail: 'helpdesk@empresa.com',
      horarioSilenciosoInicio: '22:00',
      horarioSilenciosoFim: '07:00',
    },
    seguranca: {
      tentativasLogin: 5,
      validadeSenha: 90,
      forcar2FAAdmins: false,
      exigirSenhaForte: true,
      tamanhoMinimoSenha: 8,
      exigirMaiuscula: true,
      exigirNumero: true,
      exigirSimbolo: false,
      bloquearAposFalhas: true,
      tempoBloqueioMinutos: 30,
      alertaNovoDispositivo: true,
    },
  };

  // Estado principal do formulário de configurações
  const [configuracoes, setConfiguracoes] = useState({
    ...configuracoesPadrao,
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
      
      // Setores são fonte de verdade no backend
      const response = await sectorsAPI.getAll();
      const setoresDoBackend = Array.isArray(response.data) 
        ? response.data.map(setor => (typeof setor === 'string' ? setor : setor.name))
        : [];
      
      setConfiguracoes(prev => ({
        ...prev,
        setores: setoresDoBackend,
      }));

      // Demais configurações seguem no localStorage por enquanto
      const configSalvas = localStorage.getItem('configuracoes');
      if (configSalvas) {
        try {
          const parsed = JSON.parse(configSalvas);
          const mergedConfig = {
            ...configuracoesPadrao,
            ...parsed,
            geral: {
              ...configuracoesPadrao.geral,
              ...(parsed.geral || {}),
            },
            usuarios: {
              ...configuracoesPadrao.usuarios,
              ...(parsed.usuarios || {}),
            },
            notificacoes: {
              ...configuracoesPadrao.notificacoes,
              ...(parsed.notificacoes || {}),
            },
            seguranca: {
              ...configuracoesPadrao.seguranca,
              ...(parsed.seguranca || {}),
            },
          };

          setConfiguracoes(prev => ({
            ...prev,
            ...mergedConfig,
            setores: setoresDoBackend, // Sempre usar setores do backend
          }));
        } catch (parseError) {
          console.warn('Erro ao parsear configurações do localStorage:', parseError);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setErro('Erro ao carregar configurações. Usando valores padrão.');
      // Fallback para localStorage em caso de indisponibilidade do backend
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

  /**
   * Valida uma seção específica e retorna um objeto de erros por campo.
   */
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
      if (dados.tamanhoMinimoSenha !== undefined) {
        const erro = VALIDACOES.tamanhoMinimoSenha(dados.tamanhoMinimoSenha);
        if (erro) erros.tamanhoMinimoSenha = erro;
      }
      if (dados.tempoBloqueioMinutos !== undefined) {
        const erro = VALIDACOES.tempoBloqueioMinutos(dados.tempoBloqueioMinutos);
        if (erro) erros.tempoBloqueioMinutos = erro;
      }
    }

    if (secao === 'usuarios') {
      if (dados.limiteSessaoMinutos !== undefined) {
        const erro = VALIDACOES.limiteSessaoMinutos(dados.limiteSessaoMinutos);
        if (erro) erros.limiteSessaoMinutos = erro;
      }

      if (dados.maxUsuariosAtivos !== undefined) {
        const erro = VALIDACOES.maxUsuariosAtivos(dados.maxUsuariosAtivos);
        if (erro) erros.maxUsuariosAtivos = erro;
      }
    }

    if (secao === 'notificacoes') {
      if (dados.remetenteEmail !== undefined) {
        const erro = VALIDACOES.remetenteEmail(dados.remetenteEmail);
        if (erro) erros.remetenteEmail = erro;
      }

      if (dados.horarioSilenciosoInicio !== undefined || dados.horarioSilenciosoFim !== undefined) {
        const erro = VALIDACOES.horarioSilencioso(
          dados.horarioSilenciosoInicio ?? configuracoes.notificacoes.horarioSilenciosoInicio,
          dados.horarioSilenciosoFim ?? configuracoes.notificacoes.horarioSilenciosoFim,
        );
        if (erro) erros.horarioSilencioso = erro;
      }
    }

    return erros;
  }, [configuracoes.notificacoes.horarioSilenciosoFim, configuracoes.notificacoes.horarioSilenciosoInicio]);

  /**
   * Atualiza dados de uma seção com validação prévia.
   * Retorna booleano indicando sucesso da atualização.
   */
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

  /** Remove setor no estado (update backend pendente de suporte por ID/nome). */
  const removerSetor = useCallback(async (nomeSetor) => {
    if (configuracoes.setores.length <= 1) {
      throw new Error('Você deve ter pelo menos um setor');
    }

    try {
      // Encontrar o setor pelo nome para pegar o ID
      // TODO: Quando a API retornar o ID, usar para deletar
      // Por enquanto apenas remove do estado
      setConfiguracoes(prev => ({
        ...prev,
        setores: prev.setores.filter(s => s !== nomeSetor),
      }));
      setAlteracoesPendentes(true);
    } catch (err) {
      const mensagem = err.response?.data?.error || 'Erro ao remover setor';
      throw new Error(mensagem);
    }
  }, [configuracoes.setores.length]);

  /** Edita nome do setor no estado (update backend ainda não implementado). */
  const editarSetor = useCallback(async (setorAnterior, novoNome) => {
    if (!novoNome.trim()) {
      throw new Error('Nome do setor não pode estar vazio');
    }

    if (setorAnterior === novoNome.trim()) {
      return; // Nenhuma mudança
    }

    if (configuracoes.setores.includes(novoNome.trim())) {
      throw new Error('Setor com este nome já existe');
    }

    try {
      // TODO: Quando backend implementar update, use:
      // await sectorsAPI.update(setorId, { name: novoNome.trim() });
      
      setConfiguracoes(prev => ({
        ...prev,
        setores: prev.setores.map(s => s === setorAnterior ? novoNome.trim() : s),
      }));
      setAlteracoesPendentes(true);
    } catch (err) {
      const mensagem = err.response?.data?.error || 'Erro ao editar setor';
      throw new Error(mensagem);
    }
  }, [configuracoes.setores]);

  /**
   * Valida todas as seções e persiste no localStorage.
   * Também dispara evento `config-updated` para sincronizar permissões/rotas.
   */
  const salvarConfiguracoes = useCallback(async () => {
    try {
      setCarregando(true);
      
      // Validar todas as seções antes de salvar
      const errosGeral = validar('geral', configuracoes.geral);
      const errosSeguranca = validar('seguranca', configuracoes.seguranca);
      const errosUsuarios = validar('usuarios', configuracoes.usuarios);
      const errosNotificacoes = validar('notificacoes', configuracoes.notificacoes);
      
      if (
        Object.keys(errosGeral).length > 0 ||
        Object.keys(errosSeguranca).length > 0 ||
        Object.keys(errosUsuarios).length > 0 ||
        Object.keys(errosNotificacoes).length > 0
      ) {
        const todosErros = {
          geral: errosGeral,
          seguranca: errosSeguranca,
          usuarios: errosUsuarios,
          notificacoes: errosNotificacoes,
        };
        setErrosValidacao(todosErros);
        throw new Error('Corrija os erros de validação');
      }

      // Salvar em localStorage por enquanto
      localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
      window.dispatchEvent(new Event('config-updated'));
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

  /** Reverte alterações recarregando configuração persistida. */
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
    editarSetor,
    salvar: salvarConfiguracoes,
    cancelar: cancelarAlteracoes,
    recarregar: carregarConfiguracoes,
  };
};

export default useConfiguracoes;
