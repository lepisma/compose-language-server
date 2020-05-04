import { BufferType, Buffer, Email, Name } from './types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';

function getTextTill(doc: TextDocument, pos: Position): string {
  return doc.getText({
    start: { line: 0, character: 0 },
    end: pos
  });
}

function isMu4e(doc: TextDocument): boolean {
  return doc.languageId === 'mu4e-compose';
}

function parseEmail(text: string): Email {
  // TODO: Fix this to support more variations
  if (text.includes('<')) {
    let splits = text.split('<');

    let nameSplits = splits[0].split(' ');
    let name: Name = {
      fullName: splits[0]
    };
    if (nameSplits.length > 1) {
      name.firstName = nameSplits[0]
    }

    return {
      emailId: splits[1].slice(0, -1),
      name: name
    };
  } else {
    return {
      emailId: text
    }
  }
}

function parseEmails(line: string): Email[] {
  return line.split(',').map(s => s.trim()).map(parseEmail);
}

// Parse header lines from mu4e-buffer
function parseMu4eHeaders(text: string) {
  let lines = text.split('\n').map(l => l.trim());

  let meta: { [field: string]: any } = {};

  lines.forEach(l => {
    if (l) {
      let splits = l.split(':');
      if (splits.length > 1) {
        let value = splits.slice(1).join(' ').trim();

        if (['To', 'Cc', 'Bcc'].indexOf(splits[0]) > -1) {
          // Here we parse email ids
          meta[splits[0]] = parseEmails(value);
        } else {
          meta[splits[0]] = value;
        }
      }
    }
  })

  return meta;
}

function parseMu4e(text: string): Buffer {
  let splits = text.split('--text follows this line--')
  if (splits.length === 2) {
    return {
      type: BufferType.Mu4e,
      ...parseMu4eHeaders(splits[0]),
      body: splits[1]
    };
  } else {
    return {
      type: BufferType.Plain,
      body: text
    };
  }
}

function parsePlain(text: string): Buffer {
  return {
    type: BufferType.Plain,
    body: text
  }
}

export function parse(doc: TextDocument, pos: Position): Buffer {
  let text = getTextTill(doc, pos);

  if (isMu4e(doc)) {
    return parseMu4e(text)
  } else {
    return parsePlain(text)
  }
}
