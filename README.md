# Gestão Jurídica Nex — NexLabs

Sistema SaaS premium para gestão de escritórios de advocacia, com estética corporativa da NexLabs.

## O que foi aplicado nesta versão

- Layout corporativo premium nas cores da NexLabs: preto, azul, dourado e branco.
- Remoção da área Nex AI do menu principal.
- Novo módulo **Funcionários, Ponto e Folha**:
  - cadastro de funcionário com cargo, setor, jornada, vínculo, salário e valor hora;
  - setores do escritório;
  - ponto eletrônico com entrada, intervalo, retorno e saída;
  - justificativa de atraso/ajuste;
  - painel do gestor com presença, justificativas e registros do dia;
  - folha de pagamento com cálculo de salário, faltas, atrasos, horas extras, descontos, bonificações e líquido;
  - exportação da folha em PDF pelo navegador e Excel compatível `.xls`.
- Novo acompanhamento de desempenho:
  - tarefas por processo;
  - responsável por tarefa;
  - tempo estimado x tempo gasto;
  - ranking por score;
  - produtividade por funcionário e setor.
- Novo portal do cliente:
  - acompanhamento de processos;
  - área de documentos;
  - envio de documentos pela câmera;
  - scanner com melhoria de contraste, brilho, bordas e preparação para OCR;
  - envio automático do documento ao processo.
- Relatórios premium:
  - processos;
  - ponto;
  - desempenho;
  - folha;
  - financeiro;
  - exportação PDF/Excel com cabeçalho, identidade visual, cores e rodapé NexLabs.
- Financeiro com precificador jurídico:
  - serviço;
  - complexidade;
  - urgência;
  - horas de trabalho;
  - audiências;
  - deslocamento;
  - custas;
  - valor da causa;
  - valor mínimo, recomendado, premium, entrada e êxito.
- Modo demonstração local para rodar no VS Code sem precisar configurar OAuth ou banco de dados inicialmente.

## Como rodar no VS Code

1. Extraia o ZIP.
2. Abra a pasta do projeto no VS Code.
3. No terminal, instale as dependências:

```bash
npm install
```

ou, se preferir pnpm:

```bash
corepack enable
pnpm install
```

4. Rode o projeto:

```bash
npm run dev
```

ou:

```bash
pnpm dev
```

5. Acesse o endereço mostrado no terminal, geralmente:

```bash
http://localhost:3000
```

## Observações importantes

- Esta versão roda em modo demonstração local usando dados salvos no `localStorage` do navegador.
- Para produção real, configure banco de dados, autenticação, storage de arquivos e assinatura digital.
- A exportação PDF usa o recurso de impressão do navegador: ao abrir o relatório, escolha “Salvar como PDF”.
- A exportação Excel gera arquivo `.xls` compatível com Excel/LibreOffice.

## Identidade

Rodapé discreto do sistema:

**Desenvolvido por NexLabs**


## Atualização sênior aplicada

Esta versão recebeu uma camada adicional de produto SaaS jurídico:

- nova central **Documentos, Protocolos e Assinaturas** em `/documentos`;
- scanner do cliente com edição de brilho, contraste e rotação antes do envio;
- assinatura eletrônica do cliente no portal;
- assinatura digital de funcionários, advogados e sócios;
- assinatura vinculada a documentos do processo;
- edição interna do documento pelo advogado;
- protocolo jurídico com número do órgão/tribunal;
- relatórios PDF/Excel de documentos e assinaturas;
- extensão de schema/migration para folha, assinaturas e protocolos.

### Atenção
O projeto roda em modo demonstração local usando `localStorage`. Para produção SaaS real, conectar ao banco, storage e autenticação por perfil.


## Correção para Windows/PowerShell

Esta versão já vem com script compatível com Windows. Use:

```bash
npm install --legacy-peer-deps
npm run dev
```

Se aparecer aviso de `OAUTH_SERVER_URL`, ele não impede o uso local. O app roda em modo demonstração com `NEX_DEMO_MODE=true`.

O script de analytics com `%VITE_ANALYTICS_ENDPOINT%` foi removido para evitar o erro `Malformed URI sequence`.


## Rodando no Windows / VS Code

1. Extraia o ZIP em uma pasta nova.
2. Abra o terminal do VS Code dentro da pasta do projeto.
3. Rode:

```bash
npm install --legacy-peer-deps
npm run dev
```

O servidor vai informar o endereço correto. Abra exatamente o endereço mostrado no terminal, por exemplo:

```text
http://localhost:3000/
```

Se aparecer que a porta 3000 está ocupada, o sistema pode usar 3001. Nesse caso, abra:

```text
http://localhost:3001/
```

Não rode `npm audit fix --force` nesta fase. Esse comando pode atualizar bibliotecas principais e quebrar o projeto.

Para liberar a porta 3000 no Windows:

```bash
npm run liberar-porta
```

## Correção V4 — Auth local sem OAuth

Esta versão corrige o erro:

```text
TypeError: Invalid URL at getLoginUrl
```

A aplicação agora abre em modo demonstração local quando não existir configuração OAuth. Para rodar:

```bash
npm install --legacy-peer-deps
npm run dev
```

Não execute `npm audit fix --force` antes de validar o funcionamento do app, pois ele pode alterar dependências principais como Vite, Drizzle e Vitest.
