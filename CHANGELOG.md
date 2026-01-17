# Registro de Alterações

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt/1.1.0/) e este projeto segue [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 17-01-2026

### Adicionado

* Lançamento estável inicial da **NIFVALIDATION**.
* Funcionalidade principal para validação e consulta de **NIF** angolano.
* Suporte para extração de dados do **Bilhete de Identidade (BI)**.
* Arquitetura modular e desacoplada seguindo princípios de clean code.
* Camada de serviço com abstração baseada em interfaces.
* Adaptador de automação de browser usando Puppeteer para recuperação de dados.
* Modelos de entidades para dados de identificação estruturados e normalizados.

### Técnico

* Padronização em ES Modules.
* Separação clara entre entidades, serviços, adaptadores e interfaces.
* Tratamento de erros para NIFs inválidos ou indisponíveis.
* Otimização do carregamento da página bloqueando recursos não essenciais.

### Observações

* Este release estabelece a base para melhorias futuras, como caching, retries, provedores alternativos e otimizações de performance.
