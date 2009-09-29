goog.addDependency('../abstractcommandprocessor.js',
                   ['webdriver.AbstractCommandProcessor'],
                   ['goog.array', 'webdriver.CommandName', 'webdriver.Context',
                    'webdriver.Future', 'webdriver.Response',
                    'webdriver.timing']);
goog.addDependency('../asserts.js',
                   ['webdriver.asserts', 'webdriver.asserts.Matcher'],
                   ['goog.math.Coordinate', 'webdriver.Future']);
goog.addDependency('../by.js',
                   ['webdriver.By', 'webdriver.By.Locator',
                    'webdriver.By.Strategy'],
                   ['goog.object']);
goog.addDependency('../command.js',
                   ['webdriver.Command', 'webdriver.CommandName',
                    'webdriver.Response'],
                   ['goog.array']);
goog.addDependency('../context.js', ['webdriver.Context'], []);
goog.addDependency('../factory.js', ['webdriver.factory'],
                   ['goog.userAgent', 'webdriver.LocalCommandProcessor',
                    'webdriver.WebDriver']);
goog.addDependency('../future.js', ['webdriver.Future'],
                   ['goog.events.EventType', 'goog.events.EventTarget']);
goog.addDependency('../key.js', ['webdriver.Key'], ['goog.array']);
goog.addDependency('../localcommandprocessor.js',
                   ['webdriver.LocalCommandProcessor'],
                   ['goog.array', 'goog.object',
                    'webdriver.AbstractCommandProcessor',
                    'webdriver.CommandName', 'webdriver.Context',
                    'webdriver.Response']);
goog.addDependency('../logging.js',
                   ['webdriver.logging', 'webdriver.logging.Level'],
                   ['goog.dom']);
goog.addDependency('../testrunner.js',
                   ['webdriver.TestCase', 'webdriver.TestResult',
                    'webdriver.TestRunner'],
                   ['goog.Uri', 'goog.dom', 'goog.style', 'webdriver.factory',
                    'webdriver.logging', 'webdriver.WebDriver.EventType',
                    'webdriver.timing']);
goog.addDependency('../timing.js', ['webdriver.timing'], ['goog.userAgent']);
goog.addDependency('../wait.js',
                   ['webdriver.Wait'],
                   ['goog.events', 'webdriver.Future', 'webdriver.timing']);
goog.addDependency('../webdriver.js',
                   ['webdriver.WebDriver', 'webdriver.WebDriver.EventType'],
                   ['goog.events', 'goog.events.EventTarget',
                    'webdriver.Command', 'webdriver.CommandName',
                    'webdriver.Context', 'webdriver.Future',
                    'webdriver.Response', 'webdriver.Wait',
                    'webdriver.WebElement', 'webdriver.logging',
                    'webdriver.timing']);
goog.addDependency('../webelement.js', ['webdriver.WebElement'],
                   ['goog.array', 'goog.math.Coordinate',
                    'goog.math.Size', 'webdriver.Command',
                    'webdriver.CommandName', 'webdriver.Future',
                    'webdriver.By.Locator', 'webdriver.By.Strategy']);
