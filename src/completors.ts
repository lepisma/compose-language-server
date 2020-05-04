import { Buffer, BufferType, Email, Completion, CompletorReturn, Completor } from './types';
import { spawn } from 'child_process';
import { parseOption } from './utils';

// Symbol for stopping chain of completors
const STOP = Symbol('STOP');
let COMPLETORS: Completor[];

// Completor which fills in first name after greeting
class GreetingCompleter implements Completor {
  addresseeFromEmail(email: Email): Completion {
    if (email.name && email.name.firstName) {
      return email.name.firstName;
    }
  }

  complete(buffer: Buffer): CompletorReturn {
    if (buffer.To) {
      let addressee = this.addresseeFromEmail(buffer.To[0]);

      if (addressee) {
        let re = /^(hi|hello)$/;
        if (buffer.body.trim().toLowerCase().match(re)) {
          return addressee;
        }
      }
    }
  }
}

// KenLM language model based completor
class KenLMCompletor implements Completor {
  proc: any;
  prefixSize: number;

  constructor(modelPath: string, prefixSize: number) {
    this.prefixSize = prefixSize;
    this.proc = spawn('kenlm-completor', [modelPath]);
    this.proc.stdout.setEncoding('utf-8');
  }

  async readLine(): Promise<string> {
    return new Promise((resolve, _reject) => {
      this.proc.stdout.once('data', resolve);
    })
  }

  async complete(buffer: Buffer): Promise<CompletorReturn> {
    if (buffer.body.slice(-1) !== ' ') {
      return;
    }

    let prefix = buffer.body
      .toLowerCase().trim().replace('\n', ' ').replace(/\s+/g, ' ').split(' ')
      .slice(-this.prefixSize).join(' ');

    this.proc.stdin.write(prefix + '\n');
    return (await this.readLine()).trim();
  }
}

// Initialize everything which needs initialization
export function initialize(args: string[]) {
  let kenLMModelPath = parseOption(args, '--kenlm-model-path');
  let kenLMPrefixSize = parseOption(args, '--kenlm-prefix-size');

  if (!kenLMModelPath) {
    // At the moment we assume this is needed
    throw '--kenlm-model-path not specified';
  }
  if (!kenLMPrefixSize) {
    throw '--kenlm-prefix-size not specified';
  }
  COMPLETORS = [
    new GreetingCompleter(),
    new KenLMCompletor(kenLMModelPath, parseInt(kenLMPrefixSize))
  ];
}

export async function complete(buffer: Buffer): Promise<Completion> {
  for (let comp of COMPLETORS) {
    let completion = await comp.complete(buffer);
    if (completion === STOP) {
      // Completor can have a say by force stopping rest of the completors if it
      // returns STOP symbol.
      return;
    } else if (completion)  {
      // @ts-ignore
      return completion;
    };
  }

  return;
}
