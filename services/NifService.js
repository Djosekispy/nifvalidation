import { INif } from "../interfaces/INif.js";
import { Entity } from "../entities/Nif.js";
import { PortalContribuinteProvider } from "../providers/PortalContribuinteProvider.js";

const DEFAULT_CONFIG = {
  retries: 2,
  timeoutMs: 60000,
  resultTimeoutMs: 10000,
  enableCache: false,
  cacheTtlMs: 300000,
  debug: false,
  logger: null,
};

/**
 * Serviço para consulta de NIF no portal do contribuinte.
 */
export class NifService extends INif {
  /**
   * @param {import("../adapters/PuppeteerBrowser.js").PuppeteerBrowser} browserAdapter
   * @param {{
   * retries?: number,
   * timeoutMs?: number,
   * resultTimeoutMs?: number,
   * enableCache?: boolean,
   * cacheTtlMs?: number,
   * debug?: boolean,
   * logger?: { debug?: Function, warn?: Function, error?: Function },
   * provider?: import("../interfaces/INifProvider.js").INifProvider,
   * }} [options]
   */
  constructor(browserAdapter, options = {}) {
    super();
    this.browserAdapter = browserAdapter;
    this.config = {
      retries: options.retries ?? DEFAULT_CONFIG.retries,
      timeoutMs: options.timeoutMs ?? DEFAULT_CONFIG.timeoutMs,
      resultTimeoutMs: options.resultTimeoutMs ?? DEFAULT_CONFIG.resultTimeoutMs,
      enableCache: options.enableCache ?? DEFAULT_CONFIG.enableCache,
      cacheTtlMs: options.cacheTtlMs ?? DEFAULT_CONFIG.cacheTtlMs,
      debug: options.debug ?? DEFAULT_CONFIG.debug,
      logger: options.logger ?? DEFAULT_CONFIG.logger,
    };
    this.provider = options.provider ?? new PortalContribuinteProvider();
    this.cache = new Map();
  }

  /**
   * Consulta os dados de um contribuinte por NIF/BI.
   * @param {string} nif
   * @returns {Promise<Entity>}
   * @throws {Error} Quando o NIF/BI é inválido ou o serviço está indisponível.
   */
  async getNIF(nif) {
    const normalizedNif = this.validateInput(nif);
    const fromCache = this.readFromCache(normalizedNif);
    if (fromCache) {
      this.logDebug("Cache hit para NIF", normalizedNif);
      return fromCache;
    }

    const maxAttempts = Math.max(1, Number(this.config.retries) + 1);
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let browser;

      try {
        this.logDebug(`Tentativa ${attempt}/${maxAttempts} para NIF ${normalizedNif}`);
        const context = await this.browserAdapter.createPage();
        browser = context.browser;
        const page = context.page;

        const data = await this.provider.lookup(page, normalizedNif, {
          timeoutMs: this.config.timeoutMs,
          resultTimeoutMs: this.config.resultTimeoutMs,
        });

        this.validateExtractedData(normalizedNif, data);
        const entity = new Entity(data);
        this.saveToCache(normalizedNif, entity);
        return entity;
      } catch (error) {
        lastError = error;
        this.logWarn(`Falha na tentativa ${attempt}/${maxAttempts}: ${error.message}`);
      } finally {
        if (browser) {
          await browser.close();
        }
      }

      if (attempt < maxAttempts) {
        await this.sleep(250 * attempt);
      }
    }

    this.logError("Consulta de NIF falhou apos retries", lastError?.message);
    throw new Error("NIF/BI invalido ou indisponivel");
  }

  /**
   * @param {string} nif
   * @returns {string}
   */
  validateInput(nif) {
    if (typeof nif !== "string") {
      throw new Error("NIF/BI deve ser uma string");
    }

    const normalized = nif.trim();
    if (!normalized) {
      throw new Error("NIF/BI e obrigatorio");
    }

    if (!/^[0-9A-Za-z-]+$/.test(normalized)) {
      throw new Error("NIF/BI contem caracteres invalidos");
    }

    if (normalized.length < 6 || normalized.length > 20) {
      throw new Error("NIF/BI deve ter entre 6 e 20 caracteres");
    }

    return normalized;
  }

  /**
   * @param {string} requestedNif
   * @param {{ nif?: string, name?: string, type?: string, state?: string, vatRegime?: string, residenciaFiscal?: string }} data
   */
  validateExtractedData(requestedNif, data) {
    if (!data || typeof data !== "object") {
      throw new Error("Resposta invalida do provedor");
    }

    const required = ["nif", "name", "type", "state", "vatRegime", "residenciaFiscal"];
    for (const key of required) {
      if (!String(data[key] ?? "").trim()) {
        throw new Error(`Campo obrigatorio ausente: ${key}`);
      }
    }

    const cleanRequested = requestedNif.replace(/\D/g, "");
    const cleanResponse = String(data.nif ?? "").replace(/\D/g, "");
    if (cleanRequested && cleanResponse && cleanRequested !== cleanResponse) {
      throw new Error("NIF retornado nao corresponde ao NIF consultado");
    }
  }

  /**
   * @param {string} nif
   * @returns {Entity | null}
   */
  readFromCache(nif) {
    if (!this.config.enableCache) {
      return null;
    }

    const entry = this.cache.get(nif);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(nif);
      return null;
    }

    return entry.value;
  }

  /**
   * @param {string} nif
   * @param {Entity} entity
   */
  saveToCache(nif, entity) {
    if (!this.config.enableCache) {
      return;
    }

    this.cache.set(nif, {
      value: entity,
      expiresAt: Date.now() + Math.max(1000, Number(this.config.cacheTtlMs)),
    });
  }

  /**
   * @param {number} ms
   */
  async sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * @param {...any} args
   */
  logDebug(...args) {
    if (!this.config.debug) {
      return;
    }
    const logger = this.config.logger?.debug ?? console.debug;
    logger(...args);
  }

  /**
   * @param {...any} args
   */
  logWarn(...args) {
    const logger = this.config.logger?.warn ?? (this.config.debug ? console.warn : null);
    if (logger) {
      logger(...args);
    }
  }

  /**
   * @param {...any} args
   */
  logError(...args) {
    const logger = this.config.logger?.error ?? (this.config.debug ? console.error : null);
    if (logger) {
      logger(...args);
    }
  }
}
