// Generated source.
package com.googlecode.webdriver.lift;

public class Finders {

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder link() {
    return com.googlecode.webdriver.lift.find.LinkFinder.link();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder link(java.lang.String anchorText) {
    return com.googlecode.webdriver.lift.find.LinkFinder.link(anchorText);
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder links() {
    return com.googlecode.webdriver.lift.find.LinkFinder.links();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder titles() {
    return com.googlecode.webdriver.lift.find.PageTitleFinder.titles();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder title() {
    return com.googlecode.webdriver.lift.find.PageTitleFinder.title();
  }
  
  public static com.googlecode.webdriver.lift.find.HtmlTagFinder title(String title) {
	return com.googlecode.webdriver.lift.find.PageTitleFinder.title(title);
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder images() {
    return com.googlecode.webdriver.lift.find.ImageFinder.images();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder image() {
    return com.googlecode.webdriver.lift.find.ImageFinder.image();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder table() {
    return com.googlecode.webdriver.lift.find.TableFinder.table();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder tables() {
    return com.googlecode.webdriver.lift.find.TableFinder.tables();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder cell() {
    return com.googlecode.webdriver.lift.find.TableCellFinder.cell();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder cells() {
    return com.googlecode.webdriver.lift.find.TableCellFinder.cells();
  }

  public static com.googlecode.webdriver.lift.find.HtmlTagFinder textbox() {
	return com.googlecode.webdriver.lift.find.InputFinder.textbox();
  }
  
  public static com.googlecode.webdriver.lift.find.HtmlTagFinder button() {
    return com.googlecode.webdriver.lift.find.InputFinder.submitButton();
  }
  
  public static com.googlecode.webdriver.lift.find.HtmlTagFinder button(String label) {
	 return com.googlecode.webdriver.lift.find.InputFinder.submitButton(label);
  }
}
