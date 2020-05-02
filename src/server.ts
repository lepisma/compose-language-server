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

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: true
      }
    }
  };
});

connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
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

documents.listen(connection);

connection.listen();
