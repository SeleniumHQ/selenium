
class BaseCommand(object):
  def __init__(self, driver, baseUrl):
    self.driver = driver
    if baseUrl.endswith('/'):
      self.baseUrl = baseUrl[:-1]
    else:
      self.baseUrl = baseUrl
    
