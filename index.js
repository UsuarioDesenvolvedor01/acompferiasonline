document.addEventListener('DOMContentLoaded', function () {

    /*#######################################################################################################################################################*/

    //Fazendo a inportação do banco de dados, usando a key_Url e Key_User;
    const SUPABASE_URL = 'https://znpqymdqxkqarhbnzrpg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHF5bWRxeGtxYXJoYm56cnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4Mjg5MjAsImV4cCI6MjAzNDQwNDkyMH0.2SfdJ2Wtqne8ma3QatR78jsAJsiMN9SefRWmOiOTsGY';
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    /*#######################################################################################################################################################*/

    //Função para verificar se o usuário logado está com o tokhen ativo, caso contrario redireciona para tela de login;
    function isAuthenticated() {
        //Armazeno o token local na variavel "Token";
        const token = localStorage.getItem('authToken');
        //Caso não tenha nenhum "Token"...
        if (!token) {
            //Redireciona o usuário para tela de login e finaliza meu código;
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    //Chama a função de autenticação para validar o usuário;
    if (!isAuthenticated()) return;

    /*#######################################################################################################################################################*/

    //Função para buscar o Id do usuário que está logado;
    async function obterIdUsuarioLogado() {
        //Armazeno o token na variavel "Token";
        const token = localStorage.getItem('authToken');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email;

        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Erro ao buscar ID do usuário:', error);
            return null;
        }

        return data.id;
    }

    /*#######################################################################################################################################################*/

    //Função para sair;
    function logout() {
        //Remove o "Token" do usuário logado e redireciona para a tela de login;
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    /*#######################################################################################################################################################*/

    //Armazeno os elementos "ID" do meu arquivo "Html" em variaveis;

    const calendarioContainer = document.getElementById('calendarioContainer');
    const anoSelect = document.getElementById('ano');
    const mesSelect = document.getElementById('mes');
    const deptSelect = document.getElementById('dept');
    const setorSelect = document.getElementById('setor');
    const expandirDetalhesBtn = document.getElementById('expandirDetalhes');
    const resumirDetalhesBtn = document.getElementById('resumirDetalhes');
    const sair = document.getElementById('logoutBtn');

    //Armazeno as datas e o tamanhõ dos "Quadrados" dos dias e dias da semana;

    let anoAtual = new Date().getFullYear();
    let mesAtual = new Date().getMonth(); // Mês atual (0 a 11)
    let tamanhoMes = 42.84;
    let tamanhoDiaSemana = 32;

    //Crio uma "Array" com os valores referentes aos messes do ano;

    const mesesDoAno = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    //Crio uma "Array" com os valores referentes as siglas dos dias da semana; 

    const diasDaSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

    //Crio uma "Array" vazia para armazenar posteriormente os feriados do ano atual;

    let feriados = [];

    /*#######################################################################################################################################################*/

    //Função para armazenar os feriados do ano na "Array" (feriados);
    async function obterFeriados(ano) {
        try {
            //Armazeno as informações de uma "API" na variavel "response";
            const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
            const data = await response.json();
            //Armazeno os feriados de acordo com o encontrado na "API" na minha "Array" (feriados);
            feriados = data.map(feriado => {
                const [ano, mes, dia] = feriado.date.split('-');
                return `${dia}/${mes}`;
            });
            //Caso surja algum erro no processo de busca dos feriados na "API" utilizada, o erro será retornado no console;
        } catch (error) {
            console.error('Erro ao buscar feriados:', error);
        }
    }

    /*#######################################################################################################################################################*/

    //Função para obter os funcionarios cadastrados de acordo com o "ID" do usuário atual logado;
    async function obterFuncionariosDoBancoDeDados() {
        const userId = await obterIdUsuarioLogado();
        if (!userId) {
            return [];
        }

        const { data, error } = await supabaseClient
            .from('funcionarios')
            .select('*')
            .eq('idProprietario', userId);

        if (error) {
            console.error('Erro ao buscar funcionários:', error);
            return [];
        }

        return data;
    }

    /*#######################################################################################################################################################*/

    //Função para adicionar os anos no seletor "Ano";
    function popularAnos() {
        const rangeAnos = 20;
        for (let i = anoAtual - rangeAnos; i <= anoAtual + rangeAnos; i++) {
            anoSelect.appendChild(new Option(i, i));
        }
        anoSelect.value = anoAtual;
    }

    /*#######################################################################################################################################################*/

    //Função para adicionar os messes no seletor "Mês";    
    function popularMes() {
        mesesDoAno.forEach((mes, index) => {
            mesSelect.appendChild(new Option(mes, index));
        });
        mesSelect.value = mesAtual;
    }

    /*#######################################################################################################################################################*/

    //Função para adicionar itens no seletor de acordo com o seletor chamado no escopo da função;
    function popularOpcoesSelect(selectElement, data, defaultValue = '') {
        selectElement.innerHTML = `<option value="">${defaultValue}</option>`;
        data.forEach(item => {
            selectElement.appendChild(new Option(item, item));
        });
    }

    /*#######################################################################################################################################################*/

    //Função para filtrar os funcionarios de acordo com o departamento e setor selecionado; (Ano e Mês não valem para esse filtro);
    function filtrarFuncionarios(funcionarios, departamentoFiltro, setorFiltro) {
        return funcionarios.filter(funcionario => {
            const filtroDepartamento = !departamentoFiltro || funcionario.departamento === departamentoFiltro;
            const filtroSetor = !setorFiltro || funcionario.setor === setorFiltro;
            return filtroDepartamento && filtroSetor;
        });
    }

    /*#######################################################################################################################################################*/

    //Função para adicionar a data (DD/MM) na "Array" de (feriados);
    function isFeriado(dia, mes) {
        const dataString = `${dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}`;
        return feriados.includes(dataString);
    }

    /*#######################################################################################################################################################*/

    //Função para gerar o calendario completo com todos os dados ateriores preenchidos na tela;
    async function gerarCalendario(ano, mes, departamentoFiltro, setorFiltro) {
        //Limpo a tela;
        calendarioContainer.innerHTML = '';

        //Crio um novo elemento "div" armazenado na minha variavel "tabela" para posterior manipulação;
        const tabela = document.createElement('div');
        tabela.className = 'tabela'; // Adição de class;

        //Crio um novo elemento "div" armazenado na minha variavel "cabecalhoMes" para posterior manipulação;
        const cabecalhoMes = document.createElement('div');
        cabecalhoMes.className = 'cabecalho-mes'; // Adição de class;

        //Crio um novo elemento "div" armazenado na minha variavel "cabecalhoSemana" para posterior manipulação;
        const cabecalhoSemana = document.createElement('div');
        cabecalhoSemana.className = 'cabecalho-semana'; // Adição de class;

        //Crio um novo elemento "div" armazenado na minha variavel "cabecalhoDia" para posterior manipulação;
        const cabecalhoDia = document.createElement('div');
        cabecalhoDia.className = 'cabecalho-dia'; // Adição de class;

        //Crio um novo elemento "div" armazenado na minha variavel "nomeHeader" para posterior manipulação;
        const nomeHeader = document.createElement('div');
        nomeHeader.className = 'funcionario-header'; // Adição de class;
        nomeHeader.textContent = 'Mês'; // Adição de valor "texto" no componente "div" constante na variavel "nomeHeader";

        cabecalhoMes.appendChild(nomeHeader.cloneNode(true));
        nomeHeader.textContent = 'Dia/Semana';

        cabecalhoSemana.appendChild(nomeHeader.cloneNode(true));
        nomeHeader.textContent = 'Dia/mês';

        cabecalhoDia.appendChild(nomeHeader);

        const diasNoAno = [];

        mesesDoAno.slice(mes).forEach((mesNome, index) => {
            const mesCorrente = (mes + index) % 12;
            const anoCorrente = ano + Math.floor((mes + index) / 12);
            const diasNoMes = new Date(anoCorrente, mesCorrente + 1, 0).getDate();
            const mesHeader = document.createElement('div');
            mesHeader.className = 'mes-header';
            mesHeader.textContent = mesNome;
            mesHeader.style.width = `${diasNoMes * tamanhoMes}px`;
            cabecalhoMes.appendChild(mesHeader);

            for (let dia = 1; dia <= diasNoMes; dia++) {
                diasNoAno.push({ dia, mes: mesCorrente });

                const dataAtual = new Date(anoCorrente, mesCorrente, dia);
                const diaSemana = dataAtual.getDay();
                const semanaHeader = document.createElement('div');
                semanaHeader.className = 'semana-header';
                semanaHeader.style.width = `${tamanhoDiaSemana}px`;
                semanaHeader.textContent = diasDaSemana[diaSemana];

                const diaHeader = document.createElement('div');
                diaHeader.className = 'dia-header';
                diaHeader.style.width = `${tamanhoDiaSemana}px`;
                diaHeader.textContent = dia;

                // Adiciona classes para feriados, sábados e domingos
                if (isFeriado(dia, mesCorrente)) {
                    diaHeader.classList.add('feriado');
                    semanaHeader.classList.add('feriado');
                } else if (diaSemana === 0) { // Domingo
                    diaHeader.classList.add('domingo');
                    semanaHeader.classList.add('domingo');
                } else if (diaSemana === 6) { // Sábado
                    diaHeader.classList.add('sabado');
                    semanaHeader.classList.add('sabado');
                }

                cabecalhoSemana.appendChild(semanaHeader);
                cabecalhoDia.appendChild(diaHeader);
            }
        });

        tabela.appendChild(cabecalhoMes);
        tabela.appendChild(cabecalhoSemana);
        tabela.appendChild(cabecalhoDia);

        const funcionarios = filtrarFuncionarios(await obterFuncionariosDoBancoDeDados(), departamentoFiltro, setorFiltro);

        const funcionariosAgrupados = new Map();

        funcionarios.forEach(funcionario => {
            const chaveFuncionario = funcionario.nomePrimeiro || funcionario.nomeCompleto;
            if (!funcionariosAgrupados.has(chaveFuncionario)) {
                funcionariosAgrupados.set(chaveFuncionario, { nome: chaveFuncionario, datas: [] });
            }
            const funcionarioAgrupado = funcionariosAgrupados.get(chaveFuncionario);

            funcionarioAgrupado.datas.push({ inicio: funcionario.dataIniFerias, fim: funcionario.dataFimFerias, retorno: funcionario.dataRetornoFerias });
        });

        funcionariosAgrupados.forEach(funcionario => {
            const funcionarioRow = document.createElement('div');
            funcionarioRow.className = 'funcionario-row';

            const nomeColuna = document.createElement('div');
            nomeColuna.className = 'funcionario-header';
            nomeColuna.textContent = funcionario.nome;
            funcionarioRow.appendChild(nomeColuna);

            diasNoAno.forEach(({ dia, mes }) => {
                const diaDiv = document.createElement('div');
                diaDiv.className = 'dia-col';

                const dataAtual = new Date(ano, mes, dia);

                const estaDeFerias = funcionario.datas.some(({ inicio, fim }) => {
                    // Converte a string de data de início das férias para um objeto Date
                    const dataInicioFerias = new Date(Date.parse(inicio));
                    // Converte a string de data de fim das férias para um objeto Date
                    const dataFimFerias = new Date(Date.parse(fim));
                    dataFimFerias.setDate(dataFimFerias.getDate() + 1);
                    // Verifica se a data atual está dentro do intervalo de férias do funcionário
                    // Retorna true se dataAtual for maior ou igual a dataInicioFerias e menor ou igual a dataFimFerias
                    return dataAtual >= dataInicioFerias && dataAtual <= dataFimFerias;
                });

                //--------------------------------------------------------------------------------------------------------------------------------------

                // Verifica se a data atual é o dia de retorno das férias de algum funcionário
                const eRetorno = funcionario.datas.some(({ retorno }) => {
                    // Extrai apenas a data da string de retorno (considerando que ela está no formato "dd/MM/yyyy")
                    const [dia, mes, ano] = retorno.split('/');
                    const dataRetornoFerias = new Date(`${ano}-${mes}-${dia}`); // Cria a data de retorno sem horas

                    // Compara se a data atual é exatamente igual à data de retorno das férias
                    return dataAtual.getTime() === dataRetornoFerias.getTime();
                });

                if (estaDeFerias) {
                    diaDiv.classList.add('ferias');
                }

                
                if (eRetorno) {
                    diaDiv.classList.add('retorno');
                }


                // Determina o dia da semana
                const diaSemana = dataAtual.getDay();

                // Adiciona classes para feriados, sábados e domingos
                if (isFeriado(dia, mes)) {
                    diaDiv.classList.add('feriado');
                } else if (diaSemana === 0) { // Domingo
                    diaDiv.classList.add('domingo');
                } else if (diaSemana === 6) { // Sábado
                    diaDiv.classList.add('sabado');
                }

                funcionarioRow.appendChild(diaDiv);
            });
            tabela.appendChild(funcionarioRow);
        });

        calendarioContainer.appendChild(tabela);
    }

    function expandirDetalhes() {
        tamanhoMes = 42.84;
        tamanhoDiaSemana = 32;
        gerarCalendario(anoAtual, mesAtual, deptSelect.value, setorSelect.value);
        calendarioContainer.classList.remove('resumido');
    }

    function resumirDetalhes() {
        tamanhoMes = 11.84;
        tamanhoDiaSemana = 1;
        gerarCalendario(anoAtual, mesAtual, deptSelect.value, setorSelect.value);
        calendarioContainer.classList.add('resumido');
    }

    function onChangeAnoMes() {
        anoAtual = parseInt(anoSelect.value, 10);
        mesAtual = parseInt(mesSelect.value, 10);
        obterFeriados(anoAtual).then(() => {
            gerarCalendario(anoAtual, mesAtual, deptSelect.value, setorSelect.value);
        });
    }

    function onChangeDeptSetor() {
        gerarCalendario(anoAtual, mesAtual, deptSelect.value, setorSelect.value);
    }

    async function inicializarPagina() {
        popularAnos();
        popularMes();
        const funcionarios = await obterFuncionariosDoBancoDeDados();
        popularOpcoesSelect(deptSelect, Array.from(new Set(funcionarios.map(funcionario => funcionario.departamento))).sort(), 'Todos os departamentos');
        popularOpcoesSelect(setorSelect, Array.from(new Set(funcionarios.map(funcionario => funcionario.setor))).sort(), 'Todos os setores');
        await obterFeriados(anoAtual);
        gerarCalendario(anoAtual, mesAtual, '', '');
    }

    expandirDetalhesBtn.addEventListener('click', expandirDetalhes);
    resumirDetalhesBtn.addEventListener('click', resumirDetalhes);
    anoSelect.addEventListener('change', onChangeAnoMes);
    mesSelect.addEventListener('change', onChangeAnoMes);
    deptSelect.addEventListener('change', onChangeDeptSetor);
    setorSelect.addEventListener('change', onChangeDeptSetor);
    sair.addEventListener('click', logout);

    inicializarPagina();
});