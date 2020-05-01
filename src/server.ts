#!/usr/bin/env node

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult
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

connection.onInitialize((params: InitializeParams) => {
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

let parseMetadata = (text: string) => {
  let lines = text.split('\n').map(l => l.trim());

  let meta: { [field: string]: string } = {};

  lines.forEach(l => {
    if (l) {
      let splits = l.split(':');
      if (splits.length > 1) {
        meta[splits[0]] = splits.slice(1).join(' ').trim();
      }
    }
  })

  return meta;
}

let cleanBody = (text: string): string => {
  let splits = text.split('--');
  return splits[0].trim();
}

let parseComposeBuffer = (text: string) => {
  let splits = text.split('--text follows this line--')
  if (splits.length === 2) {
    return {
      ...parseMetadata(splits[0]),
      body: cleanBody(splits[1])
    };
  } else {
    return {
      body: text.trim()
    };
  }
}

let greetingAnticipated = (text: string) => {
  let re = /^(hi|hello)$/;
  return text.toLowerCase().match(re);
}

let addressee = (text: string): string => {
  let splits = text.split('<');
  if (splits.length > 1) {
    return splits[0].split(' ')[0];
  } else {
    return text;
  }
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
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
    } else {
      return []
    }
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
