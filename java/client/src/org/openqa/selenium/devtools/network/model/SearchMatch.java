package org.openqa.selenium.devtools.network.model;

/**
 * Search match for resource
 */
public class SearchMatch {

  /**
   * Line number in resource content
   */
  private Double lineNumber;

  /**
   * Line with match content
   */
  private String lineContent;

  public Double getLineNumber() {
    return lineNumber;
  }

  public void setLineNumber(Double lineNumber) {
    this.lineNumber = lineNumber;
  }

  public String getLineContent() {
    return lineContent;
  }

  public void setLineContent(String lineContent) {
    this.lineContent = lineContent;
  }

}
