var cs;
var fadeCounter = 5;
var initcs = false;

// load scripts
CsoundObj.importScripts("../js/").then(() => {
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

function WebMIDI_init(midi_handle) {
    var haveDevs = false;
    var devs = midi_handle.inputs.values();
    for ( var m = devs.next(); m && !m.done; m = devs.next()) {
        m.value.onmidimessage = onMIDIEvent;
        haveDevs = true;
    }
    if (!haveDevs)
        console.log("No MIDIDevs");
    else {
        console.log("WebMIDI support enabled");
    }
}

function WebMIDI_err(err) {
    console.log("Error starting WebMIDI");
}

function onMIDIEvent(event) {
    cs.midiMessage(event.data[0], event.data[1], nevent.data[2]);
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

    if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(WebMIDI_init,
          WebMIDI_err);
      else
        console.log("No WebMIDI support");
}

// Prevent Refresh

window.onbeforeunload = function() {
    return "Are you...sure?" 
};
