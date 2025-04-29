document.addEventListener('DOMContentLoaded', function() {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBtxISdCskCtUxDT-HW8vIqNf8ZsY6AWQA",
        authDomain: "prelecao-a973b.firebaseapp.com",
        databaseURL: "https://prelecao-a973b-default-rtdb.firebaseio.com",
        projectId: "prelecao-a973b",
        storageBucket: "prelecao-a973b.firebasestorage.app",
        messagingSenderId: "103686484883",
        appId: "1:103686484883:web:d3eeb0bc319d575967ae66"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // Form Elements
    const form = document.getElementById('autorizacaoForm');
    const tipoAutorizacao = document.getElementById('tipoAutorizacao');
    const outroTipoAutorizacao = document.getElementById('outroTipoAutorizacao');
    const enderecosBtn = document.getElementById('enderecosBtn');
    const enderecosContainer = document.getElementById('enderecosContainer');
    const qtdEnderecos = document.getElementById('qtdEnderecos');
    const confirmarQtdBtn = document.getElementById('confirmarQtdBtn');
    const enderecosForm = document.getElementById('enderecosForm');
    const enderecoTemplate = document.getElementById('enderecoTemplate');
    
    // Mostrar/ocultar campo para especificar outro tipo de autorização
    tipoAutorizacao.addEventListener('change', function() {
        if (this.value === 'outro') {
            outroTipoAutorizacao.style.display = 'block';
            outroTipoAutorizacao.required = true;
        } else {
            outroTipoAutorizacao.style.display = 'none';
            outroTipoAutorizacao.required = false;
        }
    });
    
    // Mostrar o container de endereços ao clicar no botão
    enderecosBtn.addEventListener('click', function() {
        enderecosContainer.style.display = 'block';
    });
    
    // Gerar formulários de endereço baseado na quantidade informada
    confirmarQtdBtn.addEventListener('click', function() {
        const quantidade = parseInt(qtdEnderecos.value);
        
        if (quantidade < 1) {
            alert('Por favor, informe uma quantidade válida de endereços.');
            return;
        }
        
        // Limpar formulários existentes
        enderecosForm.innerHTML = '';
        
        // Criar os novos formulários
        for (let i = 1; i <= quantidade; i++) {
            const clone = document.importNode(enderecoTemplate.content, true);
            
            // Configurar número do endereço
            clone.querySelector('.endereco-numero').textContent = i;
            
            // Adicionar IDs únicos
            const cepInput = clone.querySelector('.cep-input');
            cepInput.id = `cep-${i}`;
            
            const ruaInput = clone.querySelector('.rua-input');
            ruaInput.id = `rua-${i}`;
            
            const numeroInput = clone.querySelector('.numero-input');
            numeroInput.id = `numero-${i}`;
            
            const bairroInput = clone.querySelector('.bairro-input');
            bairroInput.id = `bairro-${i}`;
            
            const cidadeInput = clone.querySelector('.cidade-input');
            cidadeInput.id = `cidade-${i}`;
            
            const estadoInput = clone.querySelector('.estado-input');
            estadoInput.id = `estado-${i}`;
            
            const tipoLocalInput = clone.querySelector('.tipo-local-input');
            tipoLocalInput.id = `tipo-local-${i}`;
            
            // Configurar botão de busca de CEP
            const buscarCepBtn = clone.querySelector('.buscar-cep-btn');
            buscarCepBtn.addEventListener('click', function() {
                buscarCEP(cepInput.value, ruaInput, bairroInput, cidadeInput, estadoInput);
            });
            
            // Adicionar validação para CEP (8 dígitos)
            cepInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
                if (this.value.length > 8) {
                    this.value = this.value.substring(0, 8);
                }
                
                // Formatar CEP: 00000-000
                if (this.value.length > 5) {
                    this.value = this.value.substring(0, 5) + "-" + this.value.substring(5);
                }
            });
            
            enderecosForm.appendChild(clone);
        }
    });
    
    // Função para buscar CEP usando ViaCEP API
    function buscarCEP(cep, ruaInput, bairroInput, cidadeInput, estadoInput) {
        // Limpar o CEP, deixando apenas números
        cep = cep.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            alert('CEP inválido. O CEP deve ter 8 dígitos.');
            return;
        }
        
        // URL da API ViaCEP
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado. Verifique se os dígitos estão corretos.');
                    return;
                }
                
                // Preencher os campos com os dados retornados
                ruaInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                alert('Erro ao buscar o CEP. Verifique sua conexão ou tente novamente mais tarde.');
            });
    }
    
    // Validação e envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validações básicas
        const nomePaciente = document.getElementById('nomePaciente').value;
        const rg = document.getElementById('rg').value;
        const cpf = document.getElementById('cpf').value;
        const numProcesso = document.getElementById('numProcesso').value;
        const nomeMagistrado = document.getElementById('nomeMagistrado').value;
        const dataDecisao = document.getElementById('dataDecisao').value;
        const prazoValidade = document.getElementById('prazoValidade').value;
        const tipoAutorizacaoValue = tipoAutorizacao.value;
        
        if (!nomePaciente || !rg || !cpf || !numProcesso || !nomeMagistrado || 
            !dataDecisao || !prazoValidade || !tipoAutorizacaoValue) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Verificar se há endereços preenchidos
        if (enderecosForm.children.length > 0) {
            const enderecos = [];
            let enderecosValidos = true;
            
            // Coletar informações de todos os endereços
            for (let i = 1; i <= enderecosForm.children.length; i++) {
                const cep = document.getElementById(`cep-${i}`).value;
                const rua = document.getElementById(`rua-${i}`).value;
                const numero = document.getElementById(`numero-${i}`).value;
                const bairro = document.getElementById(`bairro-${i}`).value;
                const cidade = document.getElementById(`cidade-${i}`).value;
                const estado = document.getElementById(`estado-${i}`).value;
                const tipoLocal = document.getElementById(`tipo-local-${i}`).value;
                
                if (!cep || !rua || !numero || !bairro || !cidade || !estado || !tipoLocal) {
                    alert(`Por favor, preencha todos os campos do Endereço #${i}.`);
                    enderecosValidos = false;
                    break;
                }
                
                enderecos.push({
                    cep,
                    rua,
                    numero,
                    bairro,
                    cidade,
                    estado,
                    tipoLocal
                });
            }
            
            if (!enderecosValidos) {
                return;
            }
            
            // Criar o objeto de dados a ser enviado
            const formData = {
                nomePaciente,
                rg,
                cpf,
                numProcesso,
                nomeMagistrado,
                dataDecisao,
                prazoValidade,
                tipoAutorizacao: tipoAutorizacaoValue,
                quantidadePlanta: document.getElementById('quantidadePlanta').value || 0,
                quantidadeSementes: document.getElementById('quantidadeSementes').value || 0,
                enderecos,
                dataEnvio: new Date().toISOString()
            };
            
            // Se for "outro" tipo de autorização, adicionar o valor específico
            if (tipoAutorizacaoValue === 'outro') {
                formData.outroTipoAutorizacao = outroTipoAutorizacao.value;
            }
            
            // Salvar no Firebase
            const newFormRef = database.ref('autorizacoes').push();
            newFormRef.set(formData)
                .then(() => {
                    alert('Salvo com sucesso!');
                    form.reset();
                    enderecosContainer.style.display = 'none';
                    enderecosForm.innerHTML = '';
                })
                .catch(error => {
                    console.error('Erro ao salvar os dados:', error);
                    alert('Erro ao salvar os dados. Por favor, tente novamente.');
                });
        } else {
            alert('Por favor, adicione pelo menos um endereço autorizado.');
        }
    });
});