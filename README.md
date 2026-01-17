## nifvalidation

Biblioteca em JavaScript para consulta de dados de NIF de contribuintes em Angola,
automatizando o acesso ao portal público do contribuinte com Puppeteer.

> Atenção: esta biblioteca é apenas um facilitador técnico. O uso é de sua
> responsabilidade; respeite sempre as leis locais e os termos de uso do site.

### Instalação

```bash
npm install nifvalidation
```

ou

```bash
yarn add nifvalidation
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

#### `PuppeteerBrowser`

Adaptador padrão de browser usando `puppeteer`.

- Cria uma nova instância de navegador e página
- Habilita interceptação de requests para bloquear recursos desnecessários (imagens, fontes, etc.)

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
import { getNifData, PuppeteerBrowser } from "nifvalidation";

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

### Boas práticas de uso

- Utilize apenas NIFs/BI para os quais você tenha autorização de consulta
- Evite volumes muito altos de requisições em pouco tempo (risco de bloqueio)
- Monitore alterações de layout do site: mudanças podem quebrar o scraping

