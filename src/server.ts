#!/usr/bin/env node

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind
} from 'vscode-languageserver';

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true
      }
    }
  };
});

let getText = (textDocumentPosition: TextDocumentPositionParams) => {
  let doc = documents.get(textDocumentPosition.textDocument.uri);

  if (doc)
    return doc.getText();
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.

    // TODO: Steps:
    //   - parse the document (we will cache pieces from here later)
    //   - run completion function (this is type dependent and will have a chain of functions)
    //   - ...

    let text = getText(textDocumentPosition);

    if (text) {
      // NOTE: Very specific completion just to get going as of now
      let parsed = parseComposeBuffer(text)
      if (parsed.To && greetingAnticipated(parsed.body)) {
        return [
          {
            label: addressee(parsed.To),
            kind: CompletionItemKind.Text,
            data: null
          }
        ];
      }
    }

    return []
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
