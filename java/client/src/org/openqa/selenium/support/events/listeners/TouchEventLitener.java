package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.interactions.internal.Coordinates;

public interface TouchEventLitener extends ListensToException {

	/**
	 * Called each time before {@link TouchScreen#move(int, int)} and
	 * {@link TouchScreen#up(int, int)} and {@link TouchScreen#down(int, int)}
	 * invocation
	 */
	public void beforeMovingTo(WebDriver driver, int x, int y);

	/**
	 * Called each time after {@link TouchScreen#move(int, int)} and
	 * {@link TouchScreen#up(int, int)} and {@link TouchScreen#down(int, int)}
	 * invocation
	 */
	public void afterMovingTo(WebDriver driver, int x, int y);

	/**
	 * Called each time before
	 * {@link TouchScreen#flick(Coordinates, int, int, int)} and
	 * {@link TouchScreen#flick(int, int)}
	 */
	public void beforeFlick(WebDriver driver, Coordinates where, int xOffset,
			int yOffset, int xSpeed, int ySpeed, int speed);

	/**
	 * Called each time after
	 * {@link TouchScreen#flick(Coordinates, int, int, int)} and
	 * {@link TouchScreen#flick(int, int)}
	 */
	public void afterFlick(WebDriver driver, Coordinates where, int xOffset,
			int yOffset, int xSpeed, int ySpeed, int speed);

	/**
	 * Called each time before {@link TouchScreen#scroll(int, int))} and
	 * {@link TouchScreen#scroll(Coordinates, int, int)}
	 */
	public void beforeScroll(WebDriver driver, Coordinates where, int xOffset,
			int yOffset);

	/**
	 * Called each time after {@link TouchScreen#scroll(int, int)} and
	 * {@link TouchScreen#scroll(Coordinates, int, int)}
	 */
	public void afterScroll(WebDriver driver, Coordinates where, int xOffset,
			int yOffset);

	/**
	 * Called each time before {@link TouchScreen#longPress(Coordinates)}
	 */
	public void beforeLongPress(WebDriver driver, Coordinates coordinates);

	/**
	 * Called each time after {@link TouchScreen#longPress(Coordinates)}
	 */
	public void afterLongPress(WebDriver driver, Coordinates coordinates);

	/**
	 * Called each time before {@link TouchScreen#doubleTap(Coordinates)}
	 */
	public void beforeDoubleTap(WebDriver driver, Coordinates coordinates);

	/**
	 * Called each time after {@link TouchScreen#doubleTap(Coordinates)}
	 */
	public void afterDoubleTap(WebDriver driver, Coordinates coordinates);

	/**
	 * Called each time before {@link TouchScreen#singleTap(Coordinates)}
	 */
	public void beforeSingleTap(WebDriver driver, Coordinates coordinates);

	/**
	 * Called each time after {@link TouchScreen#singleTap(Coordinates)}
	 */
	public void afterSingleTap(WebDriver driver, Coordinates coordinates);

}
