# Job Search Automation

## Descrição
Este projeto automatiza a busca de vagas de emprego em diversas plataformas, incluindo **Indeed**, **LinkedIn**, **Nerdin** e **Glassdoor**. Ele permite a filtragem de vagas, cacheia os resultados para evitar duplicatas e envia notificações por e-mail com novas oportunidades.

## Funcionalidades
- Busca de vagas em múltiplas plataformas simultaneamente.
- Filtragem de vagas por critérios definidos pelo usuário.
- Armazena e evita duplicatas de vagas já encontradas anteriormente.
- Envio automático de e-mails com novas oportunidades.
- Limpeza automática do cache para manter os dados atualizados.

## Tecnologias Utilizadas
- **Node.js**: Execução do script.
- **Axios**: Requisições HTTP para as plataformas de emprego.
- **E-mail API**: Envio de notificações com novas vagas.

## Instalação
1. Clone o repositório:
   ```sh
   git clone https://github.com/Jeanikt/job-search-automation.git
   cd job-search-automation
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```

## Como Usar
Para executar a busca de vagas, utilize:
```sh
node index.js
```

Caso deseje personalizar os filtros, modifique o objeto `filters` dentro do arquivo **index.js** ou passe parâmetros via linha de comando.

## Estrutura do Projeto
```
/job-search-automation
├── jobSearchers/
│   ├── indeed.js
│   ├── linkedin.js
│   ├── nerdin.js
│   ├── glassdoor.js
├── emailSender.js
├── jobCache.js
├── jobFilter.js
├── utils/
│   ├── retry.js
├── index.js
├── package.json
```

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

## Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

