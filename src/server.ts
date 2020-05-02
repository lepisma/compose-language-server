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

import { parse } from './parsers';
import { complete } from './completors';

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

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.

    let doc = documents.get(textDocumentPosition.textDocument.uri);
    if (doc) {
      let buffer = parse(doc, textDocumentPosition.position);
      let completion = complete(buffer);
      if (completion) {
        return [
          {
            label: completion,
            kind: CompletionItemKind.Text,
            data: null
          }
        ];
      };
    };

    return [];
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
