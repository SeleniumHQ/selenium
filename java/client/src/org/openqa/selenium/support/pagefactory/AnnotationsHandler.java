package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.How;

import java.util.HashSet;
import java.util.Set;

/**
 * A patch for {@code WebDriver} {@link org.openqa.selenium.support.pagefactory.Annotations} class.
 * <p/>
 * The need for creating it is that the original {@code WebDriver} source code provides no possibility for
 * handling different field and class annotations (only field annotations {@link FindBy}, {@link FindBys} and
 * {@link org.openqa.selenium.support.CacheLookup}) and for using different ways of annotations handling in
 * {@link org.openqa.selenium.support.pagefactory.DefaultElementLocator}.
 * <p/>
 * We need to process {@link ru.yandex.qatools.htmlelements.annotations.Block} annotation to locate blocks,
 * so we divided {@link org.openqa.selenium.support.pagefactory.Annotations} class into {@link AnnotationsHandler}
 * and {@link DefaultFieldAnnotationsHandler} to make class annotations handling possible.
 *
 * @author Alexander Tolmachev starlight@yandex-team.ru
 *         Date: 20.08.12
 */
public abstract class AnnotationsHandler {

    public abstract By buildBy();

    public abstract boolean shouldCache();

    protected By buildByFromFindBys(FindBys findBys) {
        assertValidFindBys(findBys);

        FindBy[] findByArray = findBys.value();
        By[] byArray = new By[findByArray.length];
        for (int i = 0; i < findByArray.length; i++) {
            byArray[i] = buildByFromFindBy(findByArray[i]);
        }

        return new ByChained(byArray);
    }

    protected By buildByFromFindBy(FindBy findBy) {
        assertValidFindBy(findBy);

        By ans = buildByFromShortFindBy(findBy);
        if (ans == null) {
            ans = buildByFromLongFindBy(findBy);
        }

        return ans;
    }

    protected By buildByFromLongFindBy(FindBy findBy) {
        How how = findBy.how();
        String using = findBy.using();

        switch (how) {
            case CLASS_NAME:
                return By.className(using);

            case CSS:
                return By.cssSelector(using);

            case ID:
                return By.id(using);

            case ID_OR_NAME:
                return new ByIdOrName(using);

            case LINK_TEXT:
                return By.linkText(using);

            case NAME:
                return By.name(using);

            case PARTIAL_LINK_TEXT:
                return By.partialLinkText(using);

            case TAG_NAME:
                return By.tagName(using);

            case XPATH:
                return By.xpath(using);

            default:
                // Note that this shouldn't happen (eg, the above matches all
                // possible values for the How enum)
                throw new IllegalArgumentException("Cannot determine how to locate element");
        }
    }

    protected By buildByFromShortFindBy(FindBy findBy) {
        if (!"".equals(findBy.className())) {
            return By.className(findBy.className());
        }

        if (!"".equals(findBy.css())) {
            return By.cssSelector(findBy.css());
        }

        if (!"".equals(findBy.id())) {
            return By.id(findBy.id());
        }

        if (!"".equals(findBy.linkText())) {
            return By.linkText(findBy.linkText());
        }

        if (!"".equals(findBy.name())) {
            return By.name(findBy.name());
        }

        if (!"".equals(findBy.partialLinkText())) {
            return By.partialLinkText(findBy.partialLinkText());
        }

        if (!"".equals(findBy.tagName())) {
            return By.tagName(findBy.tagName());
        }

        if (!"".equals(findBy.xpath())) {
            return By.xpath(findBy.xpath());
        }

        // Fall through
        return null;
    }

    private void assertValidFindBys(FindBys findBys) {
        for (FindBy findBy : findBys.value()) {
            assertValidFindBy(findBy);
        }
    }

    private void assertValidFindBy(FindBy findBy) {
        if (findBy.how() != null) {
            if (findBy.using() == null) {
                throw new IllegalArgumentException(
                        "If you set the 'how' property, you must also set 'using'");
            }
        }

        Set<String> finders = new HashSet<String>();
        if (!"".equals(findBy.using())) {
            finders.add("how: " + findBy.using());
        }
        if (!"".equals(findBy.className())) {
            finders.add("class name:" + findBy.className());
        }
        if (!"".equals(findBy.css())) {
            finders.add("css:" + findBy.css());
        }
        if (!"".equals(findBy.id())) {
            finders.add("id: " + findBy.id());
        }
        if (!"".equals(findBy.linkText())) {
            finders.add("link text: " + findBy.linkText());
        }
        if (!"".equals(findBy.name())) {
            finders.add("name: " + findBy.name());
        }
        if (!"".equals(findBy.partialLinkText())) {
            finders.add("partial link text: " + findBy.partialLinkText());
        }
        if (!"".equals(findBy.tagName())) {
            finders.add("tag name: " + findBy.tagName());
        }
        if (!"".equals(findBy.xpath())) {
            finders.add("xpath: " + findBy.xpath());
        }

        // A zero count is okay: it means to look by name or id.
        if (finders.size() > 1) {
            throw new IllegalArgumentException(
                    String.format("You must specify at most one location strategy. Number found: %d (%s)",
                            finders.size(), finders.toString()));
        }
    }
}
