import { INifProvider } from "../interfaces/INifProvider.js";

/**
 * Provedor padrao para consulta no Portal do Contribuinte de Angola.
 */
export class PortalContribuinteProvider extends INifProvider {
  getLookupUrl() {
    return "https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte";
  }

  /**
   * @param {import("puppeteer").Page} page
   * @param {string} nif
   * @param {{ timeoutMs: number, resultTimeoutMs: number }} options
   */
  async lookup(page, nif, options) {
    await page.goto(this.getLookupUrl(), {
      timeout: options.timeoutMs,
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#j_id_2x\\:txtNIFNumber", {
      timeout: options.timeoutMs,
    });
    await page.type("#j_id_2x\\:txtNIFNumber", nif);
    await page.click("#j_id_2x\\:j_id_34");

    await page.waitForSelector("div.panel-default-header", {
      timeout: options.resultTimeoutMs,
    });

    return page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.textContent?.trim() || "";

      return {
        nif: getText("#taxPayerNidId"),
        name: getText("div.form-group:nth-child(3) .col-sm-6:last-child label"),
        type: getText("div.form-group:nth-child(4) .col-sm-6:last-child label"),
        state: getText("div.form-group:nth-child(5) .col-sm-6:last-child label"),
        vatRegime: getText("div.form-group:nth-child(6) .col-sm-6:last-child label"),
        residenciaFiscal: getText(
          "div.form-group:nth-child(7) .col-sm-6:last-child label"
        ),
      };
    });
  }
}
