package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;

/** Call frames for assertions or error messages. */
public class StackTrace {

  private String description;

  private List<CallFrame> callFrames;

  private StackTrace parent;

  private StackTraceId parentId;

  public StackTrace() {
  }

  private StackTrace(String description,
                     List<CallFrame> callFrames,
                     StackTrace parent,
                     StackTraceId parentId) {
    this.description = description;
    this.callFrames = callFrames;
    this.parent = parent;
    this.parentId = parentId;
  }

  /**
   * String label of this stack trace. For async traces this may be a name of the function that
   * initiated the async call.
   */
  public String getDescription() {
    return description;
  }

  /**
   * String label of this stack trace. For async traces this may be a name of the function that
   * initiated the async call.
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /** JavaScript function name. */
  public List<CallFrame> getCallFrames() {
    return callFrames;
  }

  /** JavaScript function name. */
  public void setCallFrames(List<CallFrame> callFrames) {
    this.callFrames = callFrames;
  }

  /** Asynchronous JavaScript stack trace that preceded this stack, if available. */
  public StackTrace getParent() {
    return parent;
  }

  /** Asynchronous JavaScript stack trace that preceded this stack, if available. */
  public void setParent(StackTrace parent) {
    this.parent = parent;
  }

  /** Asynchronous JavaScript stack trace that preceded this stack, if available. */
  public StackTraceId getParentId() {
    return parentId;
  }

  /** Asynchronous JavaScript stack trace that preceded this stack, if available. */
  public void setParentId(StackTraceId parentId) {
    this.parentId = parentId;
  }

  public static StackTrace parseStackTrace(JsonInput input) {
    input.beginObject();
    String description = null;
    List<CallFrame> callFrames = null;
    StackTrace parent = null;
    StackTraceId parentId = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "description":
          description = input.nextString();
          break;
        case "callFrames":
          input.beginArray();
          callFrames = new ArrayList<>();
          while (input.hasNext()) {
            callFrames.add(CallFrame.parseCallFrame(input));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new StackTrace(description, callFrames, parent, parentId);
  }
}
