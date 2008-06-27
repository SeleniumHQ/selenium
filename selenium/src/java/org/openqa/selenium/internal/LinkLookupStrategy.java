package org.openqa.selenium.internal;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LinkLookupStrategy implements LookupStrategy {
    private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
    private Map<String, TextMatchingStrategy> textMatchingStrategies = new HashMap<String, TextMatchingStrategy>();

    public LinkLookupStrategy() {
        textMatchingStrategies.put("implicit", new GlobTextMatchingStrategy());
        textMatchingStrategies.put("glob", new GlobTextMatchingStrategy());
        textMatchingStrategies.put("regexp", new RegExTextMatchingStrategy());
        textMatchingStrategies.put("exact", new ExactTextMatchingStrategy());
    }

    public WebElement find(WebDriver driver, String use) {
        List<WebElement> elements = driver.findElements(By.xpath("//a"));

        String strategyName = "implicit";
        Matcher matcher = TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN.matcher(use);
        if (matcher.matches()) {
            strategyName = matcher.group(1);
            use = matcher.group(2);
        }
        TextMatchingStrategy strategy = textMatchingStrategies.get(strategyName);

        Iterator<WebElement> allLinks = elements.iterator();
        while (allLinks.hasNext()) {
            WebElement link = allLinks.next();
            if (!(strategy.isAMatch(use, link.getText())))
                allLinks.remove();
        }

        if (elements.size() > 0)
            return elements.get(0);
        throw new SeleniumException(use + " not found");
    }
}
