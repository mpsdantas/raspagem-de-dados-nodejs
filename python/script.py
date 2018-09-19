
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
import time 

import sys

url = sys.argv[1];

def getData(site):
    opts = Options()
    opts.set_headless()
    assert opts.headless  # Operating in headless mode
    browser = Firefox(options=opts)
    url = site
    browser.get(url) #navigate to the page


    form = browser.find_elements_by_id("form-solve") 
    form[0].submit()

    time.sleep(5)
    
    print(str(browser.page_source))

getData(url)



