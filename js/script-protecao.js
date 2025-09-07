document.addEventListener("DOMContentLoaded", () => {
  const checkFirebase = setInterval(() => {
    if (window.db) {
      clearInterval(checkFirebase);
      initApp();
    }
  }, 100);

  // Função para exibir mensagens
  function showMessage(text, type = 'info', duration = 5000) {
    const message = document.createElement('div');
    message.className = `message ${type}`;

    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i>';
    }

    message.innerHTML = `${icon} ${text}`;

    const container = document.querySelector('.container');
    container.insertBefore(message, container.firstChild);

    // Remove a mensagem após o tempo especificado
    setTimeout(() => {
      message.remove();
    }, duration);
  }

  function initApp() {
    const form = document.getElementById("protecao-form");
    const tabela = document.getElementById("tabela-protecao");
    const mostrarFormBtn = document.getElementById("mostrar-form");
    const submitBtn = form.querySelector("button[type='submit']");

    // Mostrar/ocultar formulário
    mostrarFormBtn.addEventListener("click", () => {
      const isVisible = form.style.display === 'none';
      form.style.display = isVisible ? 'block' : 'none';
      mostrarFormBtn.innerHTML = isVisible 
        ? '<i class="fas fa-times"></i> Cancelar'
        : '<i class="fas fa-plus"></i> Cadastrar Veículo';
    });

    // Submissão do formulário
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        placa: document.getElementById("placa").value,
        modelo: document.getElementById("modelo").value,
        telefone: document.getElementById("telefone").value,
        status: document.getElementById("status").value,
        timestamp: new Date()
      };

      try {
        // Salva os dados no Firestore
        await db.collection("protecao").add(data);
        showMessage("Cadastro de proteção veicular realizado com sucesso!", "success");

        // Fechar o formulário automaticamente
        form.reset();
        form.style.display = 'none';
        mostrarFormBtn.innerHTML = '<i class="fas fa-plus"></i> Cadastrar Veículo';

        // Atualizar a tabela automaticamente
        carregarDados();  // Chama a função para atualizar a tabela após o cadastro
      } catch (error) {
        showMessage("Erro ao cadastrar: " + error.message, "error");
      } finally {
        // Reabilita o botão após o envio
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Cadastrar';
      }
    });

    // Carregar dados
    async function carregarDados() {
      try {
        const snapshot = await db.collection("protecao").orderBy("timestamp", "desc").get();
        tabela.innerHTML = ""; // Limpa a tabela antes de adicionar os novos dados

        if (snapshot.empty) {
          tabela.innerHTML = `
            <tr>
              <td colspan="7" class="text-center">
                <i class="fas fa-inbox"></i> Nenhum registro encontrado
              </td>
            </tr>
          `;
          return;
        }

        snapshot.forEach(doc => {
          const d = doc.data();
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${d.nome}</td>
            <td>${d.cpf}</td>
            <td>${d.placa}</td>
            <td>${d.modelo}</td>
            <td>${d.telefone}</td>
            <td>${d.status}</td>
            <td>
              <button class="edit-btn" onclick="editClient('${doc.id}')">✏ Editar</button>
              <button class="delete-btn" onclick="deleteClient('${doc.id}')">❌ Excluir</button>
            </td>
          `;
          
          tabela.appendChild(tr);
        });
      } catch (error) {
        showMessage("Erro ao carregar dados: " + error.message, "error");
      }
    }

    // Função para editar cliente
    window.editClient = async (clientId) => {
      const doc = await db.collection('protecao').doc(clientId).get();
      const client = doc.data();

      // Preencher formulário com os dados do cliente
      document.getElementById("nome").value = client.nome;
      document.getElementById("cpf").value = client.cpf;
      document.getElementById("placa").value = client.placa;
      document.getElementById("modelo").value = client.modelo;
      document.getElementById("telefone").value = client.telefone;
      document.getElementById("status").value = client.status;

      // Submissão para atualizar
      const submitBtn = document.querySelector('#protecao-form button[type="submit"]');
      submitBtn.textContent = 'Atualizar';

      // Submissão do formulário para atualização
      document.getElementById("protecao-form").onsubmit = async (e) => {
        e.preventDefault();

        const updatedData = {
          nome: document.getElementById("nome").value,
          cpf: document.getElementById("cpf").value,
          placa: document.getElementById("placa").value,
          modelo: document.getElementById("modelo").value,
          telefone: document.getElementById("telefone").value,
          status: document.getElementById("status").value,
        };

        try {
          await db.collection("protecao").doc(clientId).update(updatedData);
          showMessage("Cliente atualizado com sucesso!", "success");
          carregarDados();  // Recarregar os dados da tabela
        } catch (err) {
          showMessage("Erro ao atualizar cliente: " + err.message, "error");
        } finally {
          submitBtn.textContent = 'Cadastrar';
        }
      };
    };

    // Excluir cliente
    window.deleteClient = async (clientId) => {
      if (confirm("Tem certeza que deseja excluir este cliente?")) {
        try {
          await db.collection("protecao").doc(clientId).delete();
          showMessage("Cliente excluído.", "success");
          carregarDados(); // Recarregar dados após exclusão
        } catch (err) {
          showMessage("Erro ao excluir: " + err.message, "error");
        }
      }
    };

    // Carregar dados ao inicializar
    carregarDados();
  }
});
