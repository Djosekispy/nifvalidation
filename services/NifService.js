import { INif } from "../interfaces/INif.js";
import { Entity } from "../entities/Nif.js";

/**
 * Serviço para consulta de NIF no portal do contribuinte.
 */
export class NifService extends INif {
  /**
   * @param {import("../adapters/PuppeteerBrowser.js").PuppeteerBrowser} browserAdapter
   */
  constructor(browserAdapter) {
    super();
    this.browserAdapter = browserAdapter;
  }

  /**
   * Consulta os dados de um contribuinte por NIF/BI.
   * @param {string} nif
   * @returns {Promise<Entity>}
   * @throws {Error} Quando o NIF/BI é inválido ou o serviço está indisponível.
   */
  async getNIF(nif) {
    let browser;

    try {
      const context = await this.browserAdapter.createPage();
      browser = context.browser;
      const page = context.page;

      await page.goto(
        "https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte",
        { timeout: 60000, waitUntil: "domcontentloaded" }
      );

      await page.waitForSelector('#j_id_2x\\:txtNIFNumber');
      await page.type('#j_id_2x\\:txtNIFNumber', nif);
      await page.click('#j_id_2x\\:j_id_34');

      await page.waitForSelector("div.panel-default-header", { timeout: 10000 });

      const data = await page.evaluate(() => {
        const getText = (selector) =>
          document.querySelector(selector)?.textContent?.trim() || "";

        return {
          nif: getText("#taxPayerNidId"),
          name: getText("div.form-group:nth-child(3) .col-sm-6:last-child label"),
          type: getText("div.form-group:nth-child(4) .col-sm-6:last-child label"),
          state: getText("div.form-group:nth-child(5) .col-sm-6:last-child label"),
          vatRegime: getText("div.form-group:nth-child(6) .col-sm-6:last-child label"),
          residenciaFiscal: getText("div.form-group:nth-child(7) .col-sm-6:last-child label"),
        };
      });

      return new Entity(data);
    } catch (error) {
      throw new Error("NIF/BI inválido ou indisponível");
    } finally {
      if (browser) await browser.close();
    }
  }
}
