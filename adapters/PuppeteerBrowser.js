import puppeteer from "puppeteer";

/**
 * Adaptador de browser baseado em Puppeteer.
 */
export class PuppeteerBrowser {
  /**
   * Cria um novo browser e página configurados para consulta de NIF.
   * @returns {Promise<{ browser: import("puppeteer").Browser, page: import("puppeteer").Page }>}
   */
  async createPage() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const blocked = ["image", "stylesheet", "font"];
      blocked.includes(request.resourceType())
        ? request.abort()
        : request.continue();
    });

    return { browser, page };
  }
}
