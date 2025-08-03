import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

export const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(new chrome.Options()
      .addArguments('--headless')
      .addArguments('--disable-gpu')
      .addArguments('--window-size=1920,1080')
      .addArguments('--no-sandbox')
      .addArguments('--disable-dev-shm-usage'))
  .build()
