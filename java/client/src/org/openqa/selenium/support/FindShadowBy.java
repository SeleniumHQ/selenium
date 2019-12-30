package org.openqa.selenium.support;

import org.openqa.selenium.By;
import org.openqa.selenium.support.pagefactory.ByChainedShadow;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.TYPE})
@PageFactoryFinder(FindShadowBy.FindShadowByBuilder.class)
public @interface FindShadowBy {

  FindBy[] value();

  public static class FindShadowByBuilder extends AbstractFindByBuilder {
    @Override
    public By buildIt(Object annotation, Field field) {
      FindShadowBy findBys = (FindShadowBy) annotation;
      for (FindBy findBy : findBys.value()) {
        assertValidFindBy(findBy);
      }

      FindBy[] findByArray = findBys.value();
      By[] byArray = new By[findByArray.length];
      for (int i = 0; i < findByArray.length; i++) {
        byArray[i] = buildByFromFindBy(findByArray[i]);
      }

      return new ByChainedShadow(byArray);
    }
  }
}
