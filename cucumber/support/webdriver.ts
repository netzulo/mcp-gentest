import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

export const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(new chrome.Options().headless()) // o sin .headless() para ver el navegador
  .build()
