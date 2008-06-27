// Generated source.
package org.openqa.selenium.lift;

public class Finders {

  public static org.openqa.selenium.lift.find.HtmlTagFinder link() {
    return org.openqa.selenium.lift.find.LinkFinder.link();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder link(java.lang.String anchorText) {
    return org.openqa.selenium.lift.find.LinkFinder.link(anchorText);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder links() {
    return org.openqa.selenium.lift.find.LinkFinder.links();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder titles() {
    return org.openqa.selenium.lift.find.PageTitleFinder.titles();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder title() {
    return org.openqa.selenium.lift.find.PageTitleFinder.title();
  }
  
  public static org.openqa.selenium.lift.find.HtmlTagFinder title(String title) {
	return org.openqa.selenium.lift.find.PageTitleFinder.title(title);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder images() {
    return org.openqa.selenium.lift.find.ImageFinder.images();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder image() {
    return org.openqa.selenium.lift.find.ImageFinder.image();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder table() {
    return org.openqa.selenium.lift.find.TableFinder.table();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder tables() {
    return org.openqa.selenium.lift.find.TableFinder.tables();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder cell() {
    return org.openqa.selenium.lift.find.TableCellFinder.cell();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder cells() {
    return org.openqa.selenium.lift.find.TableCellFinder.cells();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder textbox() {
	return org.openqa.selenium.lift.find.InputFinder.textbox();
  }
  
  public static org.openqa.selenium.lift.find.HtmlTagFinder button() {
    return org.openqa.selenium.lift.find.InputFinder.submitButton();
  }
  
  public static org.openqa.selenium.lift.find.HtmlTagFinder button(String label) {
	 return org.openqa.selenium.lift.find.InputFinder.submitButton(label);
  }
}
