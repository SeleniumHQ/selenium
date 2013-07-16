package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;

import java.lang.reflect.Field;

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
 * and {@link DefaultFieldAnnotations} to make class annotations handling possible.
 *
 * @author Alexander Tolmachev starlight@yandex-team.ru
 *         Date: 20.08.12
 */
public class DefaultFieldAnnotations extends Annotations {
	private Field field;

	protected Field getField() {
		return field;
	}

	public boolean isLookupCached() {
		return (field.getAnnotation(CacheLookup.class) != null);
	}

	public DefaultFieldAnnotations(Field field) {
		this.field = field;
	}

	public By buildBy() {
		assertValidAnnotations();

		By ans = null;

		FindBys findBys = field.getAnnotation(FindBys.class);
		if (findBys != null) {
			ans = buildByFromFindBys(findBys);
		}

		FindAll findAll = field.getAnnotation(FindAll.class);
		if (ans == null && findAll != null) {
			ans = buildBysFromFindByOneOf(findAll);
		}

		FindBy findBy = field.getAnnotation(FindBy.class);
		if (ans == null && findBy != null) {
			ans = buildByFromFindBy(findBy);
		}

		if (ans == null) {
			ans = buildByFromDefault();
		}

		if (ans == null) {
			throw new IllegalArgumentException("Cannot determine how to locate element " + field);
		}

		return ans;
	}

	protected By buildByFromDefault() {
		return new ByIdOrName(field.getName());
	}

	protected void assertValidAnnotations() {
		FindBys findBys = field.getAnnotation(FindBys.class);
		FindAll findAll = field.getAnnotation(FindAll.class);
		FindBy findBy = field.getAnnotation(FindBy.class);
		if (findBys != null && findBy != null) {
			throw new IllegalArgumentException("If you use a '@FindBys' annotation, " +
					"you must not also use a '@FindBy' annotation");
		}
		if (findAll != null && findBy != null) {
			throw new IllegalArgumentException("If you use a '@FindAll' annotation, " +
					"you must not also use a '@FindBy' annotation");
		}
		if (findAll != null && findBys != null) {
			throw new IllegalArgumentException("If you use a '@FindAll' annotation, " +
					"you must not also use a '@FindBys' annotation");
		}
	}
}
