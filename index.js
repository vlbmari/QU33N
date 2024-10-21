
(async () => {
    const express = require('express');
    const sequelize = require('./db');
    const Usuario = require('./usuarios');
    const Turma = require('./turmas');
    const Aluno = require('./alunos');
    const Boletim = require('./boletim');
    const cors = require('cors')
    await sequelize.sync(); //cria as tabelas dos models

    const app = express();

    app.use(express.json());
    app.use(cors()); // Para permitir que o backend seja acessado pelo frontend

    // Cadastro dos Usuários
    app.post('/cadastro/usuario', async (req, res) => {
        console.log(req.body); // Depurando o corpo da requisição
        const { nome, email, senha, site } = req.body;
    
        if (!nome || !email || !senha || !site) { //Verifica se todos os campos estão preenchidos
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios!' });
        }
    
        const usuarioExistente = await Usuario.findOne({ where: { email } }); // Analisa se o email já está cadastrado
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Email já está em uso.' });
        }
    
        try {
            const newUser = await Usuario.create({
                nome,
                email,
                senha,
                site
            });
    
            res.status(201).json({ message: 'Usuário Cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            res.status(400).json({ message: 'Erro ao cadastrar usuário', error: error.message });
        }
    });


    // Login dos Usuários

    const jwt = require('jsonwebtoken');
    const secretKey = 'Salmos23';
    const bcrypt = require('bcrypt');

    app.post('/login', async (req, res) => {
        const { email, senha } = req.body;
    
        if (!email || !senha) { // Verifica se todos os campos estão preenchidos
            return res.status(400).json({ message: 'Preencha todos os campos!' });
        }
    
        try {
            const usuario = await Usuario.findOne({ where: { email } }); // Verifica se o email é válido
            if (!usuario) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }
    
            // Verifica se a senha é válida
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }
    
            const token = jwt.sign({ id: usuario.id }, secretKey, { expiresIn: '1d' });
    
            res.status(200).json({
                message: 'Login realizado com sucesso!',
                usuario: { nome: usuario.nome, email: usuario.email },
                token,
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ message: 'Erro ao fazer login.' });
        }
    });

    

    app.post('/criarTurma', async (req, res) => {
        const { disciplina, turma, turno, data_inicial, data_final } = req.body;
    
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({ message: 'Token não fornecido.' });
        }

        try {
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id; 

            const novaTurma = await Turma.create({
                disciplina,
                turma,
                turno,
                data_inicial,
                data_final,
                usuario_id: userId
            });
    
            res.status(201).json(novaTurma);
        } catch (error) {
            console.error('Erro ao cadastrar turma:', error);
            res.status(400).send('Erro ao cadastrar turma: ' + error.message);
        }
    });

    

    


        app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

})();