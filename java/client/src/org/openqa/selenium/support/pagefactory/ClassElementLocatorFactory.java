package org.openqa.selenium.support.pagefactory;


/**
 * A factory for producing {@link ElementLocator}s for class. 
 * It is expected that a new ElementLocator will be returned per call.
 *
 * @author Artem Koshelev artkoshelev@yandex-team.ru
 */
public interface ClassElementLocatorFactory extends ElementLocatorFactory {

    ElementLocator createLocator(Class clazz);
}