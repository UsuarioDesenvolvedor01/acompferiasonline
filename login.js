const SUPABASE_URL = 'https://znpqymdqxkqarhbnzrpg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHF5bWRxeGtxYXJoYm56cnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4Mjg5MjAsImV4cCI6MjAzNDQwNDkyMH0.2SfdJ2Wtqne8ma3QatR78jsAJsiMN9SefRWmOiOTsGY';

// Import the Supabase library
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('register');
    registerButton.addEventListener('click', function () {
        window.location.href = 'register.html'; // Redireciona para a página de cadastro
    });
});

document.getElementById('formLogin').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('userName').value;
    const senha = document.getElementById('password').value;

    const messageElement = document.getElementById('message');

    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error(error);
            displayMessage(`Erro ao buscar dados do usuário: ${error.message}`, 'error');
            return;
        }

        if (data.length === 0) {
            displayMessage('Usuário não encontrado.', 'error');
            return;
        }

        const usuario = data[0];
        const hashedSenha = await hashString(senha);

        if (usuario.password !== hashedSenha) {
            displayMessage('Senha incorreta.', 'error');
            return;
        }

        // Armazena o ID do usuário no localStorage
        localStorage.setItem('userId', usuario.id);

        const token = generateJWT({ email: usuario.email });
        localStorage.setItem('authToken', token);

        displayMessage('Login realizado com sucesso!', 'success');

        window.location.href = 'index.html';

    } catch (err) {
        console.error(err);
        displayMessage('Erro ao conectar com o Supabase.', 'error');
    }
});

function generateJWT(payload) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const secret = 'seu-segredo';

    const signature = btoa(base64Header + '.' + base64Payload + '.' + secret);

    return `${base64Header}.${base64Payload}.${signature}`;
}

async function hashString(message) {
    const msgBuffer = new TextEncoder().encode(message); // Codifica a string como (utf-8)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Faz o hash da mensagem
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Converte ArrayBuffer em Array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Converte bytes para hex string
    return hashHex;
}

function displayMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
}