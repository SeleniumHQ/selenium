package org.openqa.selenium.remote;

import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class JdkAugmenterTest extends BaseAugmenterTest {

  @Override
  public BaseAugmenter getAugmenter() {
    return new JdkAugmenter();
  }
}
