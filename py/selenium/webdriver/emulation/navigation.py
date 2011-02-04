
import selenium.webdriver.emulation.base as base

class open(base.BaseCommand):
  def __call__(self, url):
    if url.find("://") == -1:
      if url.startswith('/'):
        toLoad = self.baseUrl + url
      else:
        toLoad = "%s/%s" % (self.baseUrl, url)
    else:
      toLoad = url
    self.driver.get(toLoad)
    
class go_back(base.BaseCommand):
  def __call__(self):
    self.driver.back()

class stop(base.BaseCommand):
  def __call__(self  , *args, **kwargs):
    self.driver.quit()