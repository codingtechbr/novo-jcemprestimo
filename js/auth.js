import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";  // Importação das funções de autenticação

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const mainMenu = document.getElementById('main-menu');
  const loginContainer = document.querySelector('.login-container');

  // Inicializando o Firebase Authentication
  const auth = getAuth();  // Inicializando a instância de autenticação

  // Verificar se o usuário já está logado
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Usuário logado - mostrar menu principal
      if (loginContainer) loginContainer.classList.add('hidden');
      if (mainMenu) mainMenu.classList.remove('hidden');
      showMessage(`Bem-vindo, ${user.email}!`, 'success');
    } else {
      // Usuário não logado - mostrar formulário de login
      if (loginContainer) loginContainer.classList.remove('hidden');
      if (mainMenu) mainMenu.classList.add('hidden');
    }
  });

  // Manipular o login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
      
      try {
        const result = await login(email, password);
        
        if (result.success) {
          showMessage('Login realizado com sucesso!', 'success');
          // O redirecionamento será feito automaticamente pelo onAuthStateChanged
        } else {
          showMessage('Erro no login: ' + result.error, 'error');
        }
      } catch (error) {
        showMessage('Erro no login: ' + error.message, 'error');
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
      }
    });
  }

  // Manipular logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout();
        showMessage('Logout realizado com sucesso!', 'success');
        // O redirecionamento será feito automaticamente pelo onAuthStateChanged
      } catch (error) {
        showMessage('Erro no logout: ' + error.message, 'error');
      }
    });
  }

  // Função de login
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Erro de login: ', error.message);
      return { success: false, error: error.message };
    }
  }

  // Função para logout
  async function logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout: ', error.message);
      return { success: false, error: error.message };
    }
  }

  // Função para criar usuário admin (apenas para desenvolvimento)
  window.createAdminUser = async () => {
    try {
      const result = await createUser('admin@jcemprestimos.com', 'admin123');
      if (result.success) {
        console.log('Usuário admin criado com sucesso!');
        showMessage('Usuário admin criado com sucesso!', 'success');
      } else {
        console.error('Erro ao criar usuário admin:', result.error);
        showMessage('Erro ao criar usuário admin: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Erro ao criar usuário admin:', error);
      showMessage('Erro ao criar usuário admin: ' + error.message, 'error');
    }
  };

  // Função para criar usuário no Firebase (exemplo de uso)
  async function createUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);  // Adapte aqui se for necessário criar usuário
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Função para mostrar mensagens
  function showMessage(message, type) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', type);
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);
    setTimeout(() => {
      messageContainer.remove();
    }, 3000);
  }

});
