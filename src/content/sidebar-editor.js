/*
 * Copyright 2008 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Sidebar UI of Selenium IDE.
 */

function SidebarEditor(window) {
    Editor.call(this, window);
}

objectExtend(SidebarEditor.prototype, Editor.prototype);

SidebarEditor.prototype.registerRecorder = function() {
    Recorder.registerForWindow(window.parent, this);
}

SidebarEditor.prototype.deregisterRecorder = function() {
    Recorder.deregisterForWindow(window.parent, this);
}

SidebarEditor.prototype.initMenus = function() {
    $('closeMenuSeparator').style.display = "none";
    $('closeMenuItem').style.display = "none";
}

SidebarEditor.prototype.isSidebar = function() {
    return true;
}
