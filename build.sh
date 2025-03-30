#!/bin/bash

zip -r zotero-pdf-copy.xpi * -x "*.git/*" -x "*.xpi" -x "update.json" -x "*.tmpl" -x "build.sh"

verison=$(jq -r '.version' manifest.json)

jq \
  --arg version "`jq -r '.version' manifest.json`" \
  --arg hash "sha256:`shasum -a 256 zotero-pdf-copy.xpi | cut -d' ' -f1`" \
  --arg update_link "https://github.com/xht308/zotero-pdf-copy/releases/download/v`jq -r '.version' manifest.json`/zotero-pdf-copy.xpi" \
  '.addons["zotero-pdf-copy@infty.fun"].updates[0].version = $version |
   .addons["zotero-pdf-copy@infty.fun"].updates[0].update_link = $update_link |
   .addons["zotero-pdf-copy@infty.fun"].updates[0].update_hash = $hash' \
  update.json.tmpl > update.json