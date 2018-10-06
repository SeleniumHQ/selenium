## Thanks
I would like to thank you for your valuable time and effort and applogies if this PR is rejected due to any reason.

This repository is written with the aim of providing high performance not in terms of speed only but comfortability of the user as well.

If your change is not a bug fix please check **nexttodo.md** before implementing any new feature.

### DoD
Here is the check list to publish any change

* Changes are not half implemented due to the library limitation or any other reason.
* Changes are well discussed by raising github issue. So they are well known by other contributers and users
* Echoing the above point. The purpose / goal for the PR should be mentioned in the description.
* Multiple unrelated changes should not be clubbed in single PR.
* Please run perf tests `node benchmark\perfTest3.js` before and after the changes. And mention it in PR description.
* If you are adding any dependency (specially if it is not the dev dependency) please check that 
  * it is not dependent on other language packages like c/c++
  * the package is not very old or very new, discontinued, has any vulnerability etc.
  * please check the performance and size of package
  * please check alternate available options
* Please write tests for the new changes
* Don't forget to write tests for negative cases
* Don't comment existing test case.

Changes need to do be done by owner
* Increase the version number
* Update the change log & README if required
* Generate the browser bundle
* Release in github and publish to npm

Note that publishing changes or accepting any PR may take time. So please keep patience.

### Guidelines for first time contributors

* https://github.com/Roshanjossey/first-contributions
* **Don't stretch**. If you complete an issue in long time, there is a possibility that other developers finish their part and you face code conflicts which may increase code complexity for you. So it is always good to complete an issue ASAP. 
* Please refrain to work on multiple issues marked with "first-timers-only" in the same repo. Ask and help your friends and colleagues to attempt rest issues.
* Please claim the issue and clear your doubts before raising PR. So other users will not start working on the same issue.
* Mention the issue number either in PR detail or in commit message.
* Keep increasing the level of challenge.
* Don't hesitate to question on github issue or on twitter.

