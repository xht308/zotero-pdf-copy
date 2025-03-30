#!/bin/bash

zip -r zotero-pdf-copy.xpi * -x "*.git/*" -x "*.xpi" -x "update.json" -x "*.tmpl"

jq ".addons[\"zotero-pdf-copy@infty.fun\"].updates[0].update_hash = \"sha256:`shasum -a 256 zotero-pdf-copy.xpi | cut -d' ' -f1`\"" update.json.tmpl > update.json