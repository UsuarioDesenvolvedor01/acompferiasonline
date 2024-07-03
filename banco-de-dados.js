const SUPABASE_URL = 'https://znpqymdqxkqarhbnzrpg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHF5bWRxeGtxYXJoYm56cnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4Mjg5MjAsImV4cCI6MjAzNDQwNDkyMH0.2SfdJ2Wtqne8ma3QatR78jsAJsiMN9SefRWmOiOTsGY';

// Import the Supabase library
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para verificar autenticação
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return window.location.href = 'login.html';
    }
}

isAuthenticated();

// Obtendo o id do usuario logado
async function obterIdUsuarioLogado() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = './Pages/login.html';
        return null;
    }
    return parseInt(userId, 10);
}

// Função para buscar e atualizar a tabela com os dados do Supabase
async function atualizarTabela() {
    const userId = await obterIdUsuarioLogado();
    if (!userId) {
        console.error('Erro ao obter ID do usuário logado.');
        return;
    }

    const { data, error } = await supabaseClient
        .from('funcionarios')
        .select('*')
        .eq('idProprietario', userId); // Filtra pelo ID do proprietário

    if (error) {
        console.error('Erro ao buscar funcionários:', error.message);
        return;
    }

    const tbody = document.querySelector('#tabelaFuncionarios tbody');
    tbody.innerHTML = '';

    data.forEach(funcionario => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${funcionario.matricula}</td>
            <td>${funcionario.nomeCompleto}</td>
            <td>${funcionario.nomePrimeiro}</td>
            <td>${funcionario.departamento}</td>
            <td>${funcionario.setor}</td>
            <td>${funcionario.dataAquisicao}</td>
            <td>${funcionario.dataIniFerias}</td>
            <td>${funcionario.dataFimFerias}</td>
            <td>${funcionario.dataRetornoFerias}</td>
            <td>
                <button class="edit" onclick="editarFuncionario('${funcionario.id}')">Editar</button>
                <button class="delete" onclick="excluirFuncionario('${funcionario.id}')">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Chamar a função para atualizar a tabela quando a página carregar
window.onload = async function () {
    await atualizarTabela();
};

// Função para excluir um funcionário do Supabase
async function excluirFuncionario(id) {
    const { error } = await supabaseClient
        .from('funcionarios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir funcionário:', error.message);
        return;
    }

    await atualizarTabela();
}

// Função para editar um funcionário
async function editarFuncionario(id) {
    const { data, error } = await supabaseClient
        .from('funcionarios')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erro ao buscar funcionário para edição:', error.message);
        return;
    }

    const funcionario = data;
    document.getElementById('editIndex').value = id;
    document.getElementById('editMatricula').value = funcionario.matricula;
    document.getElementById('editNomeCompleto').value = funcionario.nomeCompleto;
    document.getElementById('editPrimeiroNome').value = funcionario.nomePrimeiro;
    document.getElementById('editDepartamento').value = funcionario.departamento;
    document.getElementById('editSetor').value = funcionario.setor;
    document.getElementById('editDataAquisicaoFerias').value = funcionario.dataAquisicao;
    document.getElementById('editDataInicioFerias').value = funcionario.dataIniFerias;
    document.getElementById('editDataFinalFerias').value = funcionario.dataFimFerias;
    document.getElementById('editDataRetornoFerias').value = funcionario.dataRetornoFerias;

    document.getElementById('formEdicao').style.display = 'block';
}

// Função para salvar as edições feitas no funcionário
async function salvarEdicao() {
    const id = document.getElementById('editIndex').value;
    const matricula = document.getElementById('editMatricula').value;
    const nomeCompleto = document.getElementById('editNomeCompleto').value;
    const nomePrimeiro = document.getElementById('editPrimeiroNome').value;
    const departamento = document.getElementById('editDepartamento').value;
    const setor = document.getElementById('editSetor').value;
    const dataAquisicao = document.getElementById('editDataAquisicaoFerias').value;
    const dataIniFerias = document.getElementById('editDataInicioFerias').value;
    const dataFimFerias = document.getElementById('editDataFinalFerias').value;
    const dataRetornoFerias = document.getElementById('editDataRetornoFerias').value;

    const { error } = await supabaseClient
        .from('funcionarios')
        .update({
            matricula,
            nomeCompleto,
            nomePrimeiro,
            departamento,
            setor,
            dataAquisicao,
            dataIniFerias,
            dataFimFerias,
            dataRetornoFerias
        })
        .eq('id', id);

    if (error) {
        console.error('Erro ao atualizar funcionário:', error.message);
        return;
    }

    document.getElementById('formEdicao').style.display = 'none';
    await atualizarTabela();
}

// Função para cancelar a edição
function cancelarEdicao() {
    document.getElementById('formEdicao').style.display = 'none';
}