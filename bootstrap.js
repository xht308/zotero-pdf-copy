var PdfCopy;

function log(msg) {
	Zotero.debug("Copy PDF: " + msg);
}

function install() {
	log("Installed");
}

async function startup({ id, version, rootURI }) {
	log("Starting");
	
	// Since the function of this extension is simple, we don't need to register a preference pane.
	// Zotero.PreferencePanes.register({
	// 	pluginID: 'make-it-red@example.com',
	// 	src: rootURI + 'preferences.xhtml',
	// 	scripts: [rootURI + 'preferences.js']
	// });
	
	Services.scriptloader.loadSubScript(rootURI + 'zotero-pdf-copy.js');
	PdfCopy.init({ id, version, rootURI });
	PdfCopy.addToAllWindows();
}

function onMainWindowLoad({ window }) {
	PdfCopy.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	PdfCopy.removeFromWindow(window);
}

function shutdown() {
	log("Shutting down");
	PdfCopy.removeFromAllWindows();
	PdfCopy = undefined;
}

function uninstall() {
	log("Uninstalled");
}
