document.addEventListener("DOMContentLoaded", () => {
  const checkFirebase = setInterval(() => {
    if (window.db) {
      clearInterval(checkFirebase);
      initApp();
    }
  }, 100);

  function initApp() {
    const form = document.getElementById("inss-form");
    const tabela = document.getElementById("tabela-inss");
    const mostrarFormBtn = document.getElementById("mostrar-form-inss");

    // Mostrar/ocultar formulário
    if (mostrarFormBtn && form) {
      mostrarFormBtn.addEventListener("click", () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        mostrarFormBtn.innerHTML = form.style.display === 'block' ? '✖ Cancelar' : '👵👴 Cadastrar INSS';
      });
    }

    // Submissão do formulário
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const data = {
          nome: document.getElementById("nome-inss").value,
          cpf: document.getElementById("cpf-inss").value,
          dataOperacao: document.getElementById("dataOperacao-inss").value,
          banco: document.getElementById("banco-inss").value,
          promotor: document.getElementById("promotor-inss").value,
          vendedor: document.getElementById("vendedor-inss").value,
          valorContrato: parseFloat(document.getElementById("valorContrato-inss").value),
          comissao: parseFloat(document.getElementById("comissao-inss").value),
          status: document.getElementById("status-inss").value,
          timestamp: new Date()
        };

        try {
          await db.collection("inss").add(data);
          showMessage("Cadastro INSS realizado com sucesso!", "success");
          form.reset();
          form.style.display = 'none';
          mostrarFormBtn.innerHTML = '👵👴 Cadastrar INSS';
          carregarDados();
        } catch (error) {
          showMessage("Erro ao cadastrar: " + error.message, "error");
        }
      });
    }

    // Carregar dados
    async function carregarDados() {
      try {
        const snapshot = await db.collection("inss").orderBy("timestamp", "desc").get();
        tabela.innerHTML = "";
        snapshot.forEach(doc => {
          const d = doc.data();
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${d.nome}</td>
            <td>${d.cpf}</td>
            <td>${d.dataOperacao}</td>
            <td>${d.banco}</td>
            <td>${d.promotor}</td>
            <td>${d.vendedor}</td>
            <td>R$ ${d.valorContrato.toFixed(2)}</td>
            <td>R$ ${d.comissao.toFixed(2)}</td>
          `;

          // Status com select
          const tdStatus = document.createElement("td");
          const select = document.createElement("select");
          ["Em Análise", "Aprovado", "Reprovado"].forEach(opcao => {
            const option = document.createElement("option");
            option.value = opcao;
            option.textContent = opcao;
            if (d.status === opcao) option.selected = true;
            select.appendChild(option);
          });

          select.addEventListener("change", async () => {
            try {
              await db.collection("inss").doc(doc.id).update({ status: select.value });
              showMessage("Status atualizado!", "success");
            } catch (err) {
              showMessage("Erro ao atualizar status: " + err.message, "error");
            }
          });

          // Botão de editar
          const editarBtn = document.createElement("button");
          editarBtn.textContent = "✏ Editar";
          editarBtn.style.marginLeft = "6px";
          editarBtn.addEventListener("click", () => editClient(doc.id));

          // Botão de excluir
          const excluirBtn = document.createElement("button");
          excluirBtn.textContent = "❌";
          excluirBtn.style.marginLeft = "6px";
          excluirBtn.addEventListener("click", async () => {
            if (confirm("Tem certeza que deseja excluir este cliente?")) {
              try {
                await db.collection("inss").doc(doc.id).delete();
                tr.remove();
                showMessage("Cliente excluído.", "success");
              } catch (err) {
                showMessage("Erro ao excluir: " + err.message, "error");
              }
            }
          });

          tdStatus.appendChild(select);
          tdStatus.appendChild(editarBtn);
          tdStatus.appendChild(excluirBtn);
          tr.appendChild(tdStatus);

          tabela.appendChild(tr);
        });
      } catch (error) {
        showMessage("Erro ao carregar dados: " + error.message, "error");
      }
    }

    // Função para editar cliente
    function editClient(clientId) {
      db.collection('inss').doc(clientId).get().then(doc => {
        const client = doc.data();
        // Preencher o formulário com os dados do cliente
        document.getElementById("nome-inss").value = client.nome;
        document.getElementById("cpf-inss").value = client.cpf;
        document.getElementById("dataOperacao-inss").value = client.dataOperacao;
        document.getElementById("banco-inss").value = client.banco;
        document.getElementById("promotor-inss").value = client.promotor;
        document.getElementById("vendedor-inss").value = client.vendedor;
        document.getElementById("valorContrato-inss").value = client.valorContrato;
        document.getElementById("comissao-inss").value = client.comissao;
        document.getElementById("status-inss").value = client.status;
        
        // Atualizar o formulário com novos dados
        document.getElementById("inss-form").onsubmit = async (e) => {
          e.preventDefault();
          const updatedData = {
            nome: document.getElementById("nome-inss").value,
            cpf: document.getElementById("cpf-inss").value,
            dataOperacao: document.getElementById("dataOperacao-inss").value,
            banco: document.getElementById("banco-inss").value,
            promotor: document.getElementById("promotor-inss").value,
            vendedor: document.getElementById("vendedor-inss").value,
            valorContrato: parseFloat(document.getElementById("valorContrato-inss").value),
            comissao: parseFloat(document.getElementById("comissao-inss").value),
            status: document.getElementById("status-inss").value,
          };

          try {
            // Atualiza o cliente no Firestore
            await db.collection("inss").doc(clientId).update(updatedData);
            showMessage("Cliente atualizado com sucesso!", "success");
            carregarDados();  // Recarregar os dados da tabela
          } catch (err) {
            showMessage("Erro ao atualizar cliente: " + err.message, "error");
          }
        };
      });
    }

    // Carregar dados ao inicializar
    carregarDados();
  }
});
