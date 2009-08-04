function testBuildLocatorFromRootStrategySelectionOrder() {
  var map = webdriver.Locator.Builder.FIND_UNDER_ROOT_;
  var builder = new webdriver.Locator.Builder();
  var order = ['id', 'name', 'className', 'linkText', 'partialLinkText',
               'tagName', 'xpath'];

  function getInputObject() {
    return {
      id: 'a',
      name: 'b',
      className: 'c',
      linkText: 'd',
      partialLinkText: 'e',
      tagName: 'f',
      xpath: 'g'
    };
  }

  function testOrder(index, inputObj, expectedStrategy) {
    assertEquals(map[expectedStrategy][index],
        builder.build(inputObj).info.methodName);
    delete inputObj[expectedStrategy];
  }

  goog.array.forEach(order, goog.bind(testOrder, null, 0, getInputObject()));

  builder.findManyElements();
  goog.array.forEach(order, goog.bind(testOrder, null, 1, getInputObject()));
}


function testUnmappableLocatorsThrowErrors() {
  try {
    new webdriver.Locator.Builder().build({unmappable: 'ouch'});
    fail('Should throw an error');
  } catch (expected) {
    // Do nothing
  }
}


function testMapIdLocatorToXPath() {
  var locator = {type: 'id', target: 'myid'};
  var builder = new webdriver.Locator.Builder();
  assertEquals('//*[@id="myid"]', builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.//*[@id="myid"]', builder.mapToXPath_(locator));
}


function testMapNameLocatorToXPath() {
  var locator = {type: 'name', target: 'mr.jones'};
  var builder = new webdriver.Locator.Builder();
  assertEquals('//*[@name="mr.jones"]', builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.//*[@name="mr.jones"]', builder.mapToXPath_(locator));
}


function testMapClassNameLocatorToXPath() {
  var locator = {type: 'className', target: 'biology101'};
  var builder = new webdriver.Locator.Builder();
  var xpath =
      "//*[contains(concat(' ', normalize-space(@class), ' '),' biology101 ')]";
  assertEquals(xpath, builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.' + xpath, builder.mapToXPath_(locator));
}


function testMapLinkTextLocatorToXPath() {
  var locator = {type: 'linkText', target: 'hello, world'};
  var builder = new webdriver.Locator.Builder();
  assertEquals('//a[text()="hello, world"]', builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.//a[text()="hello, world"]', builder.mapToXPath_(locator));
}


function testMapPartialLinkTextLocatorToXPath() {
  var locator = {type: 'partialLinkText', target: 'lo, wor'};
  var builder = new webdriver.Locator.Builder();
  assertEquals('//a[contains(text(),"lo, wor")]', builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.//a[contains(text(),"lo, wor")]',
               builder.mapToXPath_(locator));
}


function testMapTagNameLocatorToXPath() {
  var locator = {type: 'tagName', target: 'div'};
  var builder = new webdriver.Locator.Builder();
  assertEquals('//div', builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals('.//div', builder.mapToXPath_(locator));
}


function testXPathLocatorMapsOntoItself() {
  var locator = {type: 'xpath', target: '//div/span/b'};
  var builder = new webdriver.Locator.Builder();
  assertEquals(locator.target, builder.mapToXPath_(locator));
  builder.underCurrentElement();
  assertEquals(locator.target, builder.mapToXPath_(locator));
}


function testClassNameLocatorsCannotContainWhitespace() {
  function assertThrows(builder, input) {
    try {
      builder.build({className: input});
      fail('Should not allow whitespace in className locator');
    } catch (expected) {
      // Do nothing
    }
  }

  function runTestSequence(builder) {
    assertThrows(builder, '  a b');
    assertThrows(builder, '  a b ');
    assertThrows(builder, 'a b');
    assertThrows(builder, 'a\tb');
    assertThrows(builder, 'a\nb\r\n\t');
    assertThrows(builder, '\r\n\t  a\n  \t\rb\r\n\t  ');
  }

  var builder = new webdriver.Locator.Builder();
  runTestSequence(builder);
  builder.findManyElements();
  runTestSequence(builder);
  builder.underCurrentElement();
  runTestSequence(builder);
}


function assertCommandInfo(method, url, info) {
  assertEquals('Wrong method', method, info.methodName);
  assertEquals('Wrong URL', url, info.url);
  assertEquals('Wrong verb', 'POST', info.verb);
}


function testBuildLocatorForOneFromRootById() {
  var locator = new webdriver.Locator.Builder().
      build({id: 'myid'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.id[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('myid', locator.target);
}


function testBuildLocatorForManyFromRootById() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({id: 'myid'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.id[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('myid', locator.target);
}


function testBuildLocatorForOneFromRootByName() {
  var locator = new webdriver.Locator.Builder().
      build({name: 'mr.jones'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.name[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('mr.jones', locator.target);
}


function testBuildLocatorForManyFromRootByName() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({name: 'mr.jones'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.name[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('mr.jones', locator.target);
}


function testBuildLocatorForOneFromRootByClassName() {
  var locator = new webdriver.Locator.Builder().
      build({className: 'biology101'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.className[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('biology101', locator.target);
}


function testBuildLocatorForManyFromRootByClassName() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({className: 'biology101'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.className[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('biology101', locator.target);
}


function testBuildLocatorForOneFromRootByLinkText() {
  var locator = new webdriver.Locator.Builder().
      build({linkText: 'hello world'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.linkText[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('hello world', locator.target);
}


function testBuildLocatorForManyFromRootByLinkText() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({linkText: 'hello world'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.linkText[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('hello world', locator.target);
}


function testBuildLocatorForOneFromRootByPartialLinkText() {
  var locator = new webdriver.Locator.Builder().
      build({partialLinkText: 'o wor'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.partialLinkText[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('o wor', locator.target);
}


function testBuildLocatorForManyFromRootByPartialLinkText() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({partialLinkText: 'o wor'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.partialLinkText[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('o wor', locator.target);
}


function testBuildLocatorForOneFromRootByTagName() {
  var locator = new webdriver.Locator.Builder().
      build({tagName: 'A'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.tagName[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('A', locator.target);
}


function testBuildLocatorForManyFromRootByTagName() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({tagName: 'A'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.tagName[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('A', locator.target);
}


function testBuildLocatorForOneFromRootByXPath() {
  var locator = new webdriver.Locator.Builder().
      build({xpath: '//div/span[@style]'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.xpath[0],
      '/session/:sessionId/:context/element',
      locator.info);
  assertEquals('//div/span[@style]', locator.target);
}


function testBuildLocatorForManyFromRootByXPath() {
  var locator = new webdriver.Locator.Builder().
      findManyElements().
      build({xpath: '//div/span[@style]'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_UNDER_ROOT_.xpath[1],
      '/session/:sessionId/:context/elements',
      locator.info);
  assertEquals('//div/span[@style]', locator.target);
}


function testBuildLocatorForOneFromElementById() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({id: 'myid'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('.//*[@id="myid"]', locator.target);
}


function testBuildLocatorForManyFromElementById() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({id: 'myid'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('.//*[@id="myid"]', locator.target);
}


function testBuildLocatorForOneFromElementByName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({name: 'mr.jones'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('.//*[@name="mr.jones"]', locator.target);
}


function testBuildLocatorForManyFromElementByName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({name: 'mr.jones'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('.//*[@name="mr.jones"]', locator.target);
}


function testBuildLocatorForOneFromElementByClassName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({className: 'biology101'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.className,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('biology101', locator.target);
}


function testBuildLocatorForManyFromElementByClassName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({className: 'biology101'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.className,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('biology101', locator.target);
}


function testBuildLocatorForOneFromElementByLinkText() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({linkText: 'hello world'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.linkText,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('hello world', locator.target);
}


function testBuildLocatorForManyFromElementByLinkText() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({linkText: 'hello world'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.linkText,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('hello world', locator.target);
}


function testBuildLocatorForOneFromElementByPartialLinkText() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({partialLinkText: 'o wor'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.partialLinkText,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('o wor', locator.target);
}


function testBuildLocatorForManyFromElementByPartialLinkText() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({partialLinkText: 'o wor'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.partialLinkText,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('o wor', locator.target);
}


function testBuildLocatorForOneFromElementByTagName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({tagName: 'A'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.tagName,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('A', locator.target);
}


function testBuildLocatorForManyFromElementByTagName() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({tagName: 'A'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.tagName,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('A', locator.target);
}


function testBuildLocatorForOneFromElementByXPath() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build({xpath: '//div/span[@style]'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('//div/span[@style]', locator.target);
}


function testBuildLocatorForManyFromElementByXPath() {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      findManyElements().
      build({xpath: '//div/span[@style]'});
  assertCommandInfo(
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath,
      '/session/:sessionId/:context/elements/:using',
      locator.info);
  assertEquals('//div/span[@style]', locator.target);
}
