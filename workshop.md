WebAudio Csound  Workshop Notes
========================

1. Introduction: system components
-----------------------------

Csound is a sound and music computing system, which is available for a variety of platforms from
supercomputers to embedded devices. The system is composed of a domain-specific language,
designed to implement audio signal processing and music control operations, and an audio
engine, which runs code compiled for it.

Its central component is the Csound library (libcsound), which provides a C-language API that allows the
Csound language compiler and engine to be manipulated programmatically. The API is available
for a variety of other languages, such as Java, Python, LISP, Lua, etc.

On the Web platform, Csound is available through a Web Assembly (WASM)-compiled libcsound,
Particularly in the case of JavaScript, the access to the C API is mediated by a higher-level interface,
provided by the CsoundObj JS API.

Due to the constraints of WASM implementation by browsers, web pages using the CsoundObj API
will need to be served via a HTTPS protocol. Note that this means that it is not possible to load these through the
FILE protocol, therefore development of WebAudio Csound applications requires a http server
to be running locally. A simple python http server is available in this repository (httpd.py).

When the API scripts are imported, a WASM binary is loaded, which, depending on the speed of
connection might take a little while. The WASM bytecode is then compiled either asynchronously
or synchronously depending on the type of WebAudio Csound implementation supported by the browser.

1.1 WebAudio Csound implementations
---------------------

There are two implementations of WebAudio Csound:

1. ScriptProcessorNode (SPN) - this runs Csound inside a SPN, which operates synchronously inside
the main browser rendering thread, alongside graphics and the other user event processing code.
This may cause interruptions in the audio processing routines that will lead to drop outs.
The WASM binary is compiled asynchronously in this case.

2. Audio Worklets (AW) - Csound is implemented as an AudioWorkletNode-derived JS class, and
in this case, it runs on a separate thread, which should make it less prone to processing interruptions
than the SPN implementation. The WASM binary is compiled synchronously in the AW thread.

From an API user point of view, these two implementations are not distinct. The same code
will run on one or the other, depending on the support provided by the browser. If AWs are
available, the second implementation is used, otherwise we fall back to SPN. We expect
that, with time, support for AW will be rolled out by the major browser vendors to their
products. Implied in all of this is the fact that WebAudio Csound depends on the presence
of support for WASM binaries and the Web Audio API.

2. Workshop Materials
----------------------

The first part of the workshop will concentrate on the csound.js frontend, which provides
a straightforward way to embed Csound in a web page. The second part will introduce the
full CsoundObj API, which provides a more comprehensive way to control Csound.

2.1 csound.js
----------------

The [csound.js](examples/js/csound.js)frontend provides a convenient way to run Csound in a browser. It provides a
ready-to use Csound object and simple methods to implemental the typical interactions
expected in terms of compilation and performance of code. The CsoundObj API is wrapped
in this frontend, and a much more simplified use is possible.

Importing the csound.js script gives the global scope the `csound` object (of type `Csound`), which represents
an instance of Csound. Calling the `Play()` method starts the engine and we can
send in Csound code as a text string for compilation using the `CompileOrc(code)` method. Compiled
instruments can be instantiated with a numeric score command using the
`Event(command)` method. The following code
except in the [basic.html](templates/basic2.html) template illustrates this:

```
// play starts performance
csound.Play();
// compile code
 csound.CompileOrc(document.getElementById('instruments').value);
 // instantiate instr 1 to perform for 2 seconds
 csound.Event("i1 0 2 0.5 440");
```

In order to sequence operations correctly the csound.js frontend provides the
means for three callbacks to be implemented by the user (depending on what
is required):

1. When the Csound WASM binary and JS scripts are fully loaded, the following
callback is executed if defined:

```
function moduleDidLoad() {
// initialisation code
}
```

2. If any event listeners (for user interactions in HTML 5 etc) are defined,
the following callback is used:

```
// called by csound.js
function attachListeners() {
// event listeners
}

```

3. The following callback, if defined, receives the console
messages issued by Csound, and can be used to print them
according to what is required by the user:

```
function handleMessage(message) {
// message is a string originating from Csound
}
      
```

Other functionality of the `Csound` class is provided in the [reference documentation](examples/docs/index.html).

2.2 CsoundObj
----------------

CsoundObj is the JS API for Csound. It provides a series of methods to manipulate an
instance of Csound, and since Csound is fully reentrant, more than one instances
can be used if necessary. The first requirement is to load the the [CsoundObj.js](examples/js/CsoundObj.js)
script. This allows access to the script loading mechanism.

Loading the Csound WASM binaries and scripts is done by the function
`CsoundObj.importScripts(location)`, where `location` is the path to the
scripts directory. This function returns a promise that can be used to
implement an initialisation callback as in

```
CsoundObj.importScripts("../examples/js/").then(() => {
// initialisation code
}

```

A Csound instance is created by the `CsoundObj` constructor; compiling
code is done by invoking `compileOrc()` on that object and the engine
is started with a call to `start()`. For completeness, we should provide
a means to calling the `destroy()` object destructor explicitly. Note
that some implementations of Web Audio require us to kickstart audio
performance by calling the context `resume()` method as well:


```
// create an instance of CsoundObj
csound = new CsoundObj();
// compile the code
csound.compileOrc(document.getElementById('instruments').value);
// start performance (CSOUND_AUDIO_CONTEXT.resume() may be required
csound.start();
// add CsoundObj destructor callback
window.addEventListener("unload", function(e) {
 if (csound != null)
            csound.destroy();
 }, false);

```


The `CsoundObj` object holds a Web Audio node that can be accessed with `getNode()`,
and this can be used to direct the output to other nodes. An example demonstrating
how a oscilloscope and a magnitude spectrum plot can be implemented
using this mechanism is shown in the [basic2.html](templates/basic2.html)
template:

```
// create Webaudio display node
scopeNode = CSOUND_AUDIO_CONTEXT.createAnalyser();
// connect Csound to scopeNode
csound.getNode().connect(scopeNode);

```

Further details on the CsoundObj API are provided in the
[reference documentation](examples/docs/index.html).
