## nifvalidation

Biblioteca em JavaScript para consulta de dados de NIF de contribuintes em Angola,
automatizando o acesso ao portal público do contribuinte com Puppeteer.

> Atenção: esta biblioteca é apenas um facilitador técnico. O uso é de sua
> responsabilidade; respeite sempre as leis locais e os termos de uso do site.

### Instalação

Via npmjs:

```bash
npm install nifvalidation
```

ou

```bash
yarn addnifvalidation
```

Via GitHub Packages (registry npm do GitHub):

```bash
npm install @djosekispy/nifvalidation --registry=https://npm.pkg.github.com
```

### Requisitos

- Node.js 18 ou superior (recomendado pela versão do Puppeteer utilizada)
- A biblioteca utiliza scraping em um portal público, portanto é necessário acesso à internet
- Em ambientes de produção, considere configurar proxies e timeouts adequados

### Conceito geral

Esta biblioteca expõe uma função de alto nível `getNifData` que:

- Abre um navegador headless com Puppeteer
- Acessa o portal público de consulta de NIF
- Preenche o formulário de consulta
- Extrai os dados principais do contribuinte e retorna em uma entidade JavaScript simples

Não armazena nenhum dado em cache por padrão; cada chamada realiza uma nova consulta.

### Uso básico (exemplo)

```js
import { getNifData } from "nifvalidation";

async function main() {
  // Exemplo de valor fictício; substitua por um NIF/BI válido no seu contexto
  const nif = "0000000000000";

  const data = await getNifData(nif);

  console.log(data.nif);
  console.log(data.name);
  console.log(data.type);
  console.log(data.state);
  console.log(data.vatRegime);
  console.log(data.residenciaFiscal);
}

main().catch(console.error);
```

### Tratamento de erros

Em caso de falha na consulta, alguns cenários comuns:

- NIF/BI inválido de acordo com as validações do portal
- Instabilidade ou indisponibilidade temporária do site
- Tempo de resposta muito alto (timeout)

Nestes casos, uma exceção será lançada:

```js
try {
  const data = await getNifData("0000000000000");
  console.log(data);
} catch (error) {
  console.error("Não foi possível consultar o NIF:", error.message);
}
```

### API

#### `getNifData(nif, options?)`

Função de alto nível para consultar os dados de um NIF/BI.

- `nif` **string** – Número de identificação fiscal ou BI (não é validado localmente).
- `options.browserAdapter` **PuppeteerBrowser (opcional)** – Permite injetar um adaptador de browser personalizado (útil para testes ou ambientes especiais).
- `options.provider` **INifProvider (opcional)** – Permite trocar a fonte de dados mantendo o mesmo contrato.
- `options.retries` **number (opcional)** – Quantidade de retries em falhas temporárias (padrão: `2`).
- `options.timeoutMs` **number (opcional)** – Timeout de carregamento da página (padrão: `60000`).
- `options.resultTimeoutMs` **number (opcional)** – Timeout para aguardar painel de resultado (padrão: `10000`).
- `options.enableCache` **boolean (opcional)** – Ativa cache em memória por NIF.
- `options.cacheTtlMs` **number (opcional)** – TTL do cache em ms (padrão: `300000`).
- `options.debug` **boolean (opcional)** – Ativa logs internos de debug/retry.
- `options.logger` **objeto (opcional)** – Logger customizado com funções `debug`, `warn`, `error`.

Retorna uma `Promise` que resolve para uma instância de `NifEntity`, com as propriedades:

- `nif` – Número de identificação fiscal retornado pelo portal
- `name` – Nome do contribuinte
- `type` – Tipo de contribuinte (por exemplo, pessoa singular/jurídica)
- `state` – Situação cadastral
- `vatRegime` – Regime de IVA
- `residenciaFiscal` – Informação de residência fiscal

#### `NifService`

Classe de serviço responsável por coordenar o fluxo de consulta no portal do contribuinte.

- Usa internamente um adaptador de browser que implemente o método `createPage`
- Encapsula a navegação, preenchimento de formulário e extração de dados
- Inclui retry com backoff simples para falhas temporárias
- Inclui validação avançada da resposta extraída
- Suporta cache opcional em memória para consultas repetidas

#### `PuppeteerBrowser`

Adaptador padrão de browser usando `puppeteer`.

- Cria uma nova instância de navegador e página
- Habilita interceptação de requests para bloquear recursos desnecessários (imagens, fontes, etc.)

#### `INifProvider` e `PortalContribuinteProvider`

- `INifProvider` define a interface para criação de novos provedores
- `PortalContribuinteProvider` é o provedor padrão para o portal do contribuinte
- Essa arquitetura permite evoluir para múltiplas fontes de consulta sem quebrar API pública

#### `NifEntity`

Entidade simples que representa o resultado da consulta, com as seguintes propriedades:

- `nif`
- `name`
- `type`
- `state`
- `vatRegime`
- `residenciaFiscal`

### Exemplo avançado: adaptador de browser customizado

Você pode criar o seu próprio adaptador de browser (por exemplo, para reutilizar
uma instância de Puppeteer ou configurar proxies) desde que exponha o método
assíncrono `createPage` que retorne `{ browser, page }`.

```js
import { getNifData, PuppeteerBrowser } from "@djosekispy/nifvalidation";

class CustomBrowser extends PuppeteerBrowser {
  // aqui você pode sobrescrever createPage ou adicionar configuração extra
}

async function main() {
  const data = await getNifData("0000000000000", {
    browserAdapter: new CustomBrowser(),
  });

  console.log(data);
}
```

### Exemplo avançado: cache + retries + logs

```js
import { getNifData } from "@djosekispy/nifvalidation";

const data = await getNifData("0000000000000", {
  retries: 3,
  timeoutMs: 60000,
  resultTimeoutMs: 12000,
  enableCache: true,
  cacheTtlMs: 5 * 60 * 1000,
  debug: true,
});

console.log(data);
```

### Qualidade e testes

```bash
npm test
npm run test:coverage
npm run lint
npm run format:check
```

### Boas práticas de uso

- Utilize apenas NIFs/BI para os quais você tenha autorização de consulta
- Evite volumes muito altos de requisições em pouco tempo (risco de bloqueio)
- Monitore alterações de layout do site: mudanças podem quebrar o scraping

### Publicação no GitHub Packages

Pré-requisitos:

- Repositório no GitHub: `Djosekispy/nifvalidation`
- Token com permissões para packages (`write:packages`, e se necessário `read:packages`)

1. Autentique o npm no registry do GitHub:

```bash
npm login --scope=@djosekispy --auth-type=legacy --registry=https://npm.pkg.github.com
```

2. Publique no GitHub Packages:

```bash
npm run publish:github
```

No CI (GitHub Actions), o workflow já publica usando `GITHUB_TOKEN` ao criar release.

