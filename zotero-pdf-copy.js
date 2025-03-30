PdfCopy = {
    id: null,
    version: null,
    rootURI: null,
    addedElementIDs: [],
    eventListener: null,

    init({ id, version, rootURI }) {
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
    },

    log(msg) {
        Zotero.debug("Copy PDF: " + msg);
    },

    addToWindow(window) {
        let doc = window.document;

        // Use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("zotero-pdf-copy.ftl");

        // Add the menu item to the Zotero item context menu
        let menuitem = doc.createXULElement('menuitem');
        menuitem.id = 'zotero-itemmenu-pdf-copy';
        menuitem.setAttribute('data-l10n-id', 'itemmenu-pdf-copy');
        menuitem.addEventListener('command', this.copySelectedItemPdfToClipboard.bind(this));
        doc.getElementById("zotero-itemmenu").appendChild(menuitem);
        this.addedElementIDs.push(menuitem.id);

        // Register a event listener to copy the PDF to clipboard
        this.eventListener = this.getEventListener(window);
        window.addEventListener("keydown", this.eventListener);
    },

    addToAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.addToWindow(win);
        }
    },

    removeFromWindow(window) {
        var doc = window.document;
        // Remove all elements added to DOM
        for (let id of this.addedElementIDs) {
            doc.getElementById(id)?.remove();
        }

        // Remove the event listener
        if (this.eventListener) {
            window.removeEventListener("keydown", this.eventListener);
            this.eventListener = null;
        }

        // Clear the addedElementIDs array
        this.addedElementIDs = [];
    },

    removeFromAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.removeFromWindow(win);
        }
    },

    copySelectedItemPdfToClipboard() {
        let item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
        this.copyItemPdfToClipboard(item);
    },

    getEventListener(window) {
        return (event) => {
            // Check the key combination for Alt+C
            if (!event.altKey || event.key !== 'c') return;
    
            // Get the current Zotero tab type
            let tabType = window.Zotero_Tabs.selectedType;
            if (tabType == "library") this.copySelectedItemPdfToClipboard();
            else if (tabType == "reader") {
                // Get the current item in the reader
                let item = Zotero.Items.get(Zotero.Reader.getByTabID(window.Zotero_Tabs.selectedID).itemID);
                // Copy the PDF to clipboard
                this.copyItemPdfToClipboard(item);
            }
        }
    },

    async copyItemPdfToClipboard(item) {
        if (!item) return;
        item = item.topLevelItem;
        attachment = await item.getBestAttachment();
        if (!attachment || !attachment.isPDFAttachment()) return;
        let path = attachment.getFilePath();
        if (!path) return;
        clip = Services.clipboard;
        var trans = Components.classes["@mozilla.org/widget/transferable;1"]
            .createInstance(Components.interfaces.nsITransferable);
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsIFile);
        trans.init(null);
        trans.addDataFlavor("application/x-moz-file");
        file.initWithPath(path);
        const flavorProvider = {
            QueryInterface: ChromeUtils.generateQI([Components.interfaces.nsIFlavorDataProvider]),
            getFlavorData: function (transferable, flavor, data, dataLen) {
                if (flavor === "application/x-moz-file") {
                    data.value = file;
                    // dataLen.value = 1;
                }
            }
        };
        trans.setTransferData("application/x-moz-file", flavorProvider, 0);
        clip.setData(trans, null, clip.kGlobalClipboard);
    }
}