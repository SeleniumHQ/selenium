goog.addDependency('../asserts.js',
                   ['webdriver.asserts', 'webdriver.asserts.Matcher'],
                   ['goog.math.Coordinate', 'webdriver.Future']);
goog.addDependency('../command.js',
                   ['webdriver.Command', 'webdriver.CommandInfo',
                    'webdriver.Response'], []);
goog.addDependency('../context.js', ['webdriver.Context'], []);
goog.addDependency('../factory.js', ['webdriver.factory'],
                   ['goog.userAgent', 'webdriver.LocalCommandProcessor',
                    'webdriver.WebDriver']);
goog.addDependency('../future.js', ['webdriver.Future'],
                   ['goog.events.EventType', 'goog.events.EventTarget']);
goog.addDependency('../key.js', ['webdriver.Key'], ['goog.array']);
goog.addDependency('../localcommandprocessor.js',
                   ['webdriver.LocalCommandProcessor'],
                   ['webdriver.Context', 'webdriver.Response']);
goog.addDependency('../logging.js',
                   ['webdriver.logging', 'webdriver.logging.Level'],
                   ['goog.dom']);
goog.addDependency('../testrunner.js',
                   ['webdriver.TestCase', 'webdriver.TestResult',
                    'webdriver.TestRunner'],
                   ['goog.Uri', 'goog.dom', 'goog.style', 'webdriver.factory',
                    'webdriver.logging', 'webdriver.Event',
                    'webdriver.Event.Type']);
goog.addDependency('../webdriver.js',
                   ['webdriver.Event', 'webdriver.Event.Type',
                    'webdriver.WebDriver'],
                   ['goog.events', 'goog.events.Event',
                    'goog.events.EventTarget', 'webdriver.Command',
                    'webdriver.CommandInfo', 'webdriver.Context',
                    'webdriver.Future', 'webdriver.Response',
                    'webdriver.WebElement']);
goog.addDependency('../webelement.js',
                   ['webdriver.Locator', 'webdriver.WebElement'],
                   ['goog.array', 'goog.json', 'goog.math.Coordinate',
                    'goog.math.Size', 'webdriver.CommandInfo',
                    'webdriver.Future']);
