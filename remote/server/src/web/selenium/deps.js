goog.addDependency('../abstractcommandprocessor.js',
                   ['webdriver.AbstractCommandProcessor'],
                   ['goog.array', 'webdriver.CommandName', 'webdriver.Context',
                    'webdriver.Future', 'webdriver.Response']);
goog.addDependency('../asserts.js',
                   ['webdriver.asserts', 'webdriver.asserts.Matcher'],
                   ['goog.math.Coordinate', 'webdriver.Future']);
goog.addDependency('../command.js',
                   ['webdriver.Command', 'webdriver.CommandName',
                    'webdriver.LocatorStrategy', 'webdriver.Response'],
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
                    'webdriver.logging', 'webdriver.WebDriver.EventType']);
goog.addDependency('../wait.js',
                   ['webdriver.Wait'],
                   ['goog.Timer', 'webdriver.Future']);
goog.addDependency('../webdriver.js',
                   ['webdriver.WebDriver', 'webdriver.WebDriver.EventType'],
                   ['goog.Timer', 'goog.events', 'goog.events.EventTarget',
                    'webdriver.Command', 'webdriver.CommandName',
                    'webdriver.Context', 'webdriver.Future',
                    'webdriver.Response', 'webdriver.Wait',
                    'webdriver.WebElement', 'webdriver.logging']);
goog.addDependency('../webelement.js', ['webdriver.WebElement'],
                   ['goog.array', 'goog.json', 'goog.math.Coordinate',
                    'goog.math.Size', 'webdriver.Command',
                    'webdriver.CommandName', 'webdriver.Future',
                    'webdriver.LocatorStrategy']);
