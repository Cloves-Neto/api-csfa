# API CSFA (Backend Core)

<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript" />
<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />

<br>

> Serviço de backend monolítico modular responsável por orquestrar dados, gerenciar o estado da aplicação, regras de negócio e integrações para todo o ecossistema do Colégio São Francisco de Assis (CSFA).

### 📌 Resumo Executivo

Desenvolvido sob os preceitos da **Clean Architecture** e dos princípios **SOLID**, este projeto foca em alto desacoplamento, facilitando a testabilidade e evolução contínua da base de código. A API atua como Single Source of Truth para as aplicações client (App CMS e Institucional).

> [!IMPORTANT]
> Este projeto atua como servidor centralizado. Modificações nos contratos de Response ou estruturação de DTOs afetam diretamente o CMS e o Site Institucional.

<details>
<summary>🛠️ Padrão Arquitetural Implementado (Clique para expandir)</summary>

O projeto evita acoplamento através da segregação em camadas lógicas:
1. **Controllers (Presentation):** Lidam exclusivamente com *Requests/Responses* HTTP.
2. **Use Cases / Services (Domain):** Encapsulam as regras de negócio puras (Padrão GoF: Command/Strategy).
3. **Repositories (Data Access):** Abstraem a complexidade do Prisma ORM e consultas ao banco (Repository Pattern).
</details>

<details>
<summary>📂 Estrutura de Diretórios (Hierarquia de Domínio)</summary>

```text
src/
├── app/               # Inicialização e configurações do Servidor Express
├── config/            # Variáveis de ambiente e integrações (Env, DB, Mail)
├── middlewares/       # Interceptadores genéricos (Auth, Error Handling, RBAC)
└── modules/           # Módulos de negócio independentes (Ex: users, auth, posts)
    └── [domain]/
        ├── controllers/
        ├── services/
        ├── repositories/
        └── routes/
```
</details>

## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:

- Instalou a versão LTS mais recente do `<Node.js>`
- Possui uma string de conexão válida para um servidor `<PostgreSQL>` (NeonDB/Supabase/Local).
- Tem conhecimento sobre a arquitetura `<Clean Architecture>` adotada no backend.

## 🚀 Instalando a API CSFA

Para instalar a API CSFA, siga estas etapas:

```bash
git clone https://github.com/Cloves-Neto/api-csfa.git
cd api-csfa
npm install
```

Crie o arquivo de configuração de ambiente `.env` baseado no exemplo existente:
```env
PORT=3333
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="sua_chave_criptografica_aqui"
```

Realize a sincronização do Prisma e, caso necessário, popule o banco:
```bash
npx prisma db push
npm run prisma:seed
```

## ☕ Usando a API CSFA

O processo roda em *watch mode* usando a biblioteca `tsx` para compilação instantânea.

```bash
npm run dev
```

> [!TIP]
> O servidor estará escutando no endereço `http://localhost:3333` (ou a porta que você configurou no ambiente).

---

## 🔄 Atualizações e Roadmap

**Versão Atual:** `1.0.0-beta`

> [!TIP]
> Este projeto está em desenvolvimento ativo. Confira as implementações em andamento abaixo.

### 🚧 Próximas Features (Em Progresso)
- [ ] Cobertura de testes unitários com Jest/Vitest.

---

## 👨‍💻 Desenvolvedor

<a href="https://github.com/Cloves-Neto">
 <img style="border-radius: 50%;" src="https://github.com/Cloves-Neto.png" width="100px;" alt="Cloves Neto"/>
</a>

**Cloves Neto**

[![Portfólio](https://img.shields.io/badge/Portfólio-devneto.com.br-000000?style=for-the-badge&logo=google-chrome&logoColor=white)](https://devneto.com.br)<br>
[![E-mail](https://img.shields.io/badge/E--mail-cvr.neto20%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:cvr.neto20@gmail.com)<br>
[![WhatsApp](https://img.shields.io/badge/WhatsApp-(11)967338685-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/5511967338685)
