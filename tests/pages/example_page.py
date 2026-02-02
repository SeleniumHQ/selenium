class ExamplePage:
    URL = "https://example.com"

    def __init__(self, driver):
        self.driver = driver

    def open(self):
        self.driver.get(self.URL)

    @property
    def title(self):
        return self.driver.title
