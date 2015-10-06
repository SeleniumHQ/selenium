package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.internal.Coordinates;

public interface MouseEventListener extends ListensToException {

	/**
	 * Called each time before {@link Mouse#mouseMove(Coordinates)} and
	 * {@link Mouse#mouseMove(Coordinates, long, long)} and
	 * {@link Mouse#mouseDown(Coordinates)} and {@link Mouse#mouseUp(Coordinates)}
	 * invocation
	 */
	public void beforeMouseIsMoved(WebDriver driver, Coordinates where,
			long xOffset, long yOffset);

	/**
	 * Called each time after {@link Mouse#mouseMove(Coordinates)} and
	 * {@link Mouse#mouseMove(Coordinates, long, long)} and
	 * {@link Mouse#mouseDown(Coordinates)} and {@link Mouse#mouseUp(Coordinates)}
	 * invocation
	 */
	public void afterMouseIsMoved(WebDriver driver, Coordinates where,
			long xOffset, long yOffset);

	/**
	 * Called each time before {@link Mouse#contextClick(Coordinates)} invocation
	 */
	public void beforeContextClick(WebDriver driver, Coordinates where);

	/**
	 * Called each time after {@link Mouse#contextClick(Coordinates)} invocation
	 */
	public void afterContextClick(WebDriver driver, Coordinates where);

	/**
	 * Called each time before {@link Mouse#doubleClick(Coordinates)} invocation
	 */
	public void beforeDoubleClick(WebDriver driver, Coordinates where);

	/**
	 * Called each time after {@link Mouse#doubleClick(Coordinates)} invocation
	 */
	public void afterDoubleClick(WebDriver driver, Coordinates where);

	/**
	 * Called each time before {@link Mouse#click(Coordinates)} invocation
	 */
	public void beforeClick(WebDriver driver, Coordinates where);

	/**
	 * Called each time after {@link Mouse#click(Coordinates)} invocation
	 */
	public void afterClick(WebDriver driver, Coordinates where);
}
