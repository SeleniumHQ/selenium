var diagInfo = window.arguments[0];

function init() {
  _loadDiagInfo();
}

function submitInfo() {
  if (!document.getElementById('consent').checked) {
    alert("The diagnostic information will be submitted only if you provide your consent through the check box");
    return false;
  }
  return true;
}

function cancelSubmit() {
  diagInfo.data = "";
  return true;
}

function _loadDiagInfo() {
  document.getElementById('diag').value = diagInfo.data;
}

function mask() {
  var maskText = document.getElementById('mask');
  diagInfo.data = diagInfo.data.replace(maskText.value, '*****', 'g');
  maskText.value = "";
  _loadDiagInfo();
}

