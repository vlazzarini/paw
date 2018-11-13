var cs;
var fadeCounter = 5;
var initcs = false;

// load scripts
CsoundObj.importScripts("../examples/js/").then(() => {
        startCsound();
        initcs = true;
 });


function evalCode() {
	cs.compileOrc(editor.getSelection());
}


let editor = CodeMirror.fromTextArea(
	document.getElementById("csoundCodeEditor"), 
	{
		lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    theme: "monokai",
    mode: "csound",
		extraKeys: {
			"Ctrl-E": evalCode,
		},
	});


function loadCSD(editor, csdFile) {
  var client = new XMLHttpRequest();
  client.open('GET', csdFile, true);
  client.onreadystatechange = function() {
    editor.setValue(client.responseText);
  }
  client.send();
}


function startCsound() {
    cs = new CsoundObj();
    cs.compileOrc("sr=48000\nksmps=32\n0dbfs=1\nnchnls=2\n");
    cs.start();  
    var ld = document.getElementById("loadDiv");
    if(ld != null) {
      ld.remove();
    }
    editor.refresh();
    editor.focus();
    editor.setCursor(0,0);
}

// Prevent Refresh

window.onbeforeunload = function() {
  return "Are you...sure?" 
};
