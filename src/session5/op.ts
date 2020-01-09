import { hash160, hash256 } from './helper';
import { S256Point, Signature } from './ecc';

function encode_num(num: number): Buffer {
  if (num == 0) return Buffer.from([]);
  let abs_num = Math.abs(num);
  const negative = num < 0;
  let result = Buffer.from([]);
  while (abs_num) {
    //result.append(abs_num & 0xff)
    result = Buffer.concat([result, Buffer.from([abs_num & 0xff])]);
    abs_num = abs_num >> 8;
  }
  //# if the top bit is set,
  //# for negative numbers we ensure that the top bit is set
  //# for positive numbers we ensure that the top bit is not set
  if (result[-1] & 0x80) {
    if (negative) {
      //result.append(0x80)
      result = Buffer.concat([result, Buffer.from([0x80])]);
    } else {
      result = Buffer.concat([result, Buffer.from([0x00])]);
    }
  } else if (negative) {
    result[-1] |= 0x80;
  }
  return result;
}

export function decode_num(element: Buffer): number {
  /*
  def decode_num(element):
    if element == b'':
        return 0
    # reverse for big endian
    big_endian = element[::-1]
    # top bit being 1 means it's negative
    if big_endian[0] & 0x80:
        negative = True
        result = big_endian[0] & 0x7f
    else:
        negative = False
        result = big_endian[0]
    for c in big_endian[1:]:
        result <<= 8
        result += c
    if negative:
        return -result
    else:
        return result

  */
  if (element.toString() == '') return 0;
  element.reverse();
  const rv = element.slice(0, element.length).reduce((acc, cv) => {
    acc = acc << 8;
    acc = acc + cv;
    return acc;
  });

  return rv;
}

function op_0(stack: Buffer[]): boolean {
  stack.push(encode_num(0));
  return true;
}

function op_1(stack: Buffer[]): boolean {
  stack.push(encode_num(1));
  return true;
}

function op_1negate(stack: Buffer[]): boolean {
  stack.push(encode_num(-1));
  return true;
}

function op_2(stack: Buffer[]): boolean {
  stack.push(encode_num(2));
  return true;
}

function op_3(stack: Buffer[]): boolean {
  stack.push(encode_num(3));
  return true;
}

function op_4(stack: Buffer[]): boolean {
  stack.push(encode_num(4));
  return true;
}

function op_5(stack: Buffer[]): boolean {
  stack.push(encode_num(5));
  return true;
}

function op_6(stack: Buffer[]): boolean {
  stack.push(encode_num(6));
  return true;
}

function op_7(stack: Buffer[]): boolean {
  stack.push(encode_num(7));
  return true;
}

function op_8(stack: Buffer[]): boolean {
  stack.push(encode_num(8));
  return true;
}

function op_9(stack: Buffer[]): boolean {
  stack.push(encode_num(9));
  return true;
}

function op_10(stack: Buffer[]): boolean {
  stack.push(encode_num(10));
  return true;
}

function op_11(stack: Buffer[]): boolean {
  stack.push(encode_num(11));
  return true;
}

function op_12(stack: Buffer[]): boolean {
  stack.push(encode_num(12));
  return true;
}

function op_13(stack: Buffer[]): boolean {
  stack.push(encode_num(13));
  return true;
}

function op_14(stack: Buffer[]): boolean {
  stack.push(encode_num(14));
  return true;
}

function op_15(stack: Buffer[]): boolean {
  stack.push(encode_num(15));
  return true;
}

function op_16(stack: Buffer[]): boolean {
  stack.push(encode_num(16));
  return true;
}

function op_nop(stack: Buffer[]): boolean {
  return true;
}

function op_if(stack: Buffer[]): boolean {
  stack.push(encode_num(1));
  return true;
}

function op_notif(stack: Buffer[]): boolean {
  stack.push(encode_num(1));
  return true;
}

function op_verify(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  if (decode_num(element!) == 0) return false;
  return true;
}

function op_return(stack: Buffer[]): boolean {
  return false;
}

function op_toaltstack(stack: Buffer[], altstack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  altstack.push(stack.pop()!);
  return true;
}

function op_fromaltstack(stack: Buffer[], altstack: Buffer[]): boolean {
  if (altstack.length < 1) return false;
  stack.push(altstack.pop()!);
  return true;
}

function op_2drop(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack.pop();
  stack.pop();
  return true;
}

function op_2dup(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack = stack.concat(stack.slice(stack.length - 2, stack.length));
  return true;
}

function op_3dup(stack: Buffer[]): boolean {
  if (stack.length < 3) return false;
  stack = stack.concat(stack.slice(stack.length - 3, stack.length));
  return true;
}

function op_2over(stack: Buffer[]): boolean {
  if (stack.length < 4) return false;
  stack = stack.concat(stack.slice(stack.length - 4, stack.length - 2));
  return true;
}

function op_2rot(stack: Buffer[]): boolean {
  if (stack.length < 6) return false;
  stack = stack.concat(stack.slice(stack.length - 6, stack.length - 4));
  return true;
}

function op_2swap(stack: Buffer[]): boolean {
  if (stack.length < 4) return false;
  stack = stack.concat(
    stack.slice(stack.length - 2, stack.length),
    stack.slice(stack.length - 4, stack.length - 2)
  );
  return true;
}

function op_ifdup(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  if (decode_num(stack[stack.length]) != 0) stack.push(stack[stack.length]);
  return true;
}

export function op_depth(stack: Buffer[]): boolean {
  stack.push(encode_num(stack.length));
  return true;
}

export function op_drop(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  stack.pop();
  return true;
}

function op_dup(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  stack.push(stack[stack.length - 1]);
  return true;
}

function op_nip(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack.splice(stack.length - 1, 1);
  return true;
}

function op_over(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack.push(stack[stack.length - 2]);
  return true;
}

function op_pick(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const n = decode_num(stack.pop()!);
  if (stack.length < n + 1) return false;

  stack.push(stack[stack.length - n - 1]);
  return true;
}

function op_roll(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const n = decode_num(stack.pop()!);
  if (stack.length < n + 1) return false;
  if (n == 0) return true;
  stack = stack.concat(stack, stack.splice(stack.length - n - 1, 1));
  return true;
}

function op_rot(stack: Buffer[]): boolean {
  if (stack.length < 3) return false;
  stack = stack.concat(stack, stack.splice(stack.length - 3, 1));
  return true;
}

function op_swap(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack = stack.concat(stack, stack.splice(stack.length - 2, 1));
  return true;
}

function op_tuck(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  stack.concat(
    stack.slice(0, stack.length - 3),
    stack[stack.length],
    stack.slice(stack.length - 1, stack.length)
  );
  return true;
}

function op_size(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  stack.push(encode_num(stack[stack.length].length));
  return true;
}

function op_equal(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = stack.pop();
  const element2 = stack.pop();
  if (element1!.toString('hex') == element2!.toString('hex'))
    stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_equalverify(stack: Buffer[]): boolean {
  return op_equal(stack) && op_verify(stack);
}

function op_1add(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  stack.push(encode_num(element + 1));
  return true;
}

function op_1sub(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  stack.push(encode_num(element - 1));
  return true;
}

function op_negate(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  stack.push(encode_num(-element));
  return true;
}

function op_abs(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  if (element < 1) stack.push(encode_num(-element));
  else stack.push(encode_num(element));
  return true;
}

function op_not(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  if (element < 1) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_0notequal(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = decode_num(stack.pop()!);
  if (element == 0) stack.push(encode_num(0));
  else stack.push(encode_num(1));
  return true;
}

function op_add(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  stack.push(encode_num(element1 + element2));
  return true;
}

function op_sub(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  stack.push(encode_num(element1 - element2));
  return true;
}

function op_booland(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 && element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
  return true;
}

function op_boolor(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 || element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_numequal(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 == element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_numequalverify(stack: Buffer[]): boolean {
  return op_numequal(stack) && op_verify(stack);
}

function op_numnotequal(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 == element2) stack.push(encode_num(0));
  else stack.push(encode_num(1));
  return true;
}

function op_lessthan(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 > element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_greaterthan(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 < element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_lessthanorequal(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 >= element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_greaterthanorequal(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 <= element2) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_min(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 < element2) stack.push(encode_num(element1));
  else stack.push(encode_num(element2));
  return true;
}

function op_max(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;
  const element1 = decode_num(stack.pop()!);
  const element2 = decode_num(stack.pop()!);
  if (element1 > element2) stack.push(encode_num(element1));
  else stack.push(encode_num(element2));
  return true;
}

function op_within(stack: Buffer[]): boolean {
  if (stack.length < 3) return false;
  const maximum = decode_num(stack.pop()!);
  const minimum = decode_num(stack.pop()!);
  const element = decode_num(stack.pop()!);
  if (element >= minimum && element < maximum) stack.push(encode_num(1));
  else stack.push(encode_num(0));
  return true;
}

function op_ripemd160(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  stack.push(
    Buffer.from(
      hash
        .ripemd160()
        .update(element)
        .digest('hex'),
      'hex'
    )
  );

  return true;
}

function op_sha1(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  stack.push(
    Buffer.from(
      hash
        .sha1()
        .update(element)
        .digest('hex'),
      'hex'
    )
  );
  return true;
}

function op_sha256(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  stack.push(
    Buffer.from(
      hash
        .sha256()
        .update(element)
        .digest('hex'),
      'hex'
    )
  );
  return true;
}

export function op_hash160(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  const h160 = hash160(element as Buffer);
  stack.push(h160);
  return true;
}

function op_hash256(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;
  const element = stack.pop();
  const h256 = hash256(element!);
  stack.push(element!);
  return true;
}

export function op_checksig(stack: Buffer[], z: bigint): boolean {
  //# check to see if there's at least 2 elements
  if (stack.length < 2) return false;
  //# get the sec_pubkey with stack.pop()
  const sec_pubkey: Buffer = stack.pop() as Buffer;
  //# get the der_signature with stack.pop()[:-1] (last byte is removed)
  const ds: Buffer = stack.pop() as Buffer;
  const der_signature = ds.slice(0, ds.length - 1);
  //# parse the sec format pubkey with S256Point
  const point = S256Point.parse(sec_pubkey);
  //# parse the der format signature with Signature
  const sig = Signature.parse(der_signature);
  //# verify using the point, z and signature
  //# if verified add encode_num(1) to the end, otherwise encode_num(0)
  if (point.verify(z, sig)) {
    stack.push(encode_num(1));
  } else {
    stack.push(encode_num(0));
  }
  return true;
}

function op_checksigverify(stack: Buffer[], z: bigint): boolean {
  return op_checksig(stack, z) && op_verify(stack);
}

export function op_checkmultisig(stack: Buffer[], z: bigint): boolean {
  if (stack.length < 1) return false;
  const n = decode_num(stack.pop()!);
  if (stack.length < n + 1) return false;
  let sec_pubkeys: Buffer[] = [];
  for (let index = 0; index < n; index++) {
    sec_pubkeys.push(stack.pop()!);
  }
  const m = decode_num(stack.pop()!);
  if (stack.length < m + 1) return false;
  let der_signatures: Buffer[] = [];
  for (let index = 0; index < m; index++) {
    let der_signature = stack.pop();
    der_signature = der_signature!.slice(0, der_signature!.length - 1);
    der_signatures.push(der_signature!);
  }
  stack.pop();
  const points = sec_pubkeys.map(sec => S256Point.parse(sec));
  const sigs = der_signatures.map(der => Signature.parse(der));

  sigs.map(sig => points.map(point => point.verify(z, sig)));
  stack.push(encode_num(1));
  return true;
}

function op_checkmultisigverify(stack: Buffer[], z: bigint): boolean {
  return op_checkmultisig(stack, z) && op_verify(stack);
}

function op_checklocktimeverify(
  stack: Buffer[],
  locktime: bigint,
  sequence: bigint
): boolean {
  return true;
}

function op_checksequenceverify(
  stack: Buffer[],
  version: bigint,
  sequence: bigint
): boolean {
  return true;
}

export const OP_CODE_FUNCTIONS = {
  0: op_0,
  79: op_1negate,
  81: op_1,
  82: op_2,
  83: op_3,
  84: op_4,
  85: op_5,
  86: op_6,
  87: op_7,
  88: op_8,
  89: op_9,
  90: op_10,
  91: op_11,
  92: op_12,
  93: op_13,
  94: op_14,
  95: op_15,
  96: op_16,
  97: op_nop,
  99: op_if,
  100: op_notif,
  105: op_verify,
  106: op_return,
  107: op_toaltstack,
  108: op_fromaltstack,
  109: op_2drop,
  110: op_2dup,
  111: op_3dup,
  112: op_2over,
  113: op_2rot,
  114: op_2swap,
  115: op_ifdup,
  116: op_depth,
  117: op_drop,
  118: op_dup,
  119: op_nip,
  120: op_over,
  121: op_pick,
  122: op_roll,
  123: op_rot,
  124: op_swap,
  125: op_tuck,
  130: op_size,
  135: op_equal,
  136: op_equalverify,
  139: op_1add,
  140: op_1sub,
  143: op_negate,
  144: op_abs,
  145: op_not,
  146: op_0notequal,
  147: op_add,
  148: op_sub,
  154: op_booland,
  155: op_boolor,
  156: op_numequal,
  157: op_numequalverify,
  158: op_numnotequal,
  159: op_lessthan,
  160: op_greaterthan,
  161: op_lessthanorequal,
  162: op_greaterthanorequal,
  163: op_min,
  164: op_max,
  165: op_within,
  166: op_ripemd160,
  167: op_sha1,
  168: op_sha256,
  169: op_hash160,
  170: op_hash256,
  172: op_checksig,
  173: op_checksigverify,
  174: op_checkmultisig,
  175: op_checkmultisigverify,
  176: op_nop,
  177: op_checklocktimeverify,
  178: op_checksequenceverify,
  179: op_nop,
  180: op_nop,
  181: op_nop,
  182: op_nop,
  183: op_nop,
  184: op_nop,
  185: op_nop
};

const OP_CODES = {
  '0': 'OP_0',
  '76': 'OP_PUSHDATA1',
  '77': 'OP_PUSHDATA2',
  '78': 'OP_PUSHDATA4',
  '79': 'OP_1NEGATE',
  '80': 'OP_RESERVED',
  '81': 'OP_1',
  '82': 'OP_2',
  '83': 'OP_3',
  '84': 'OP_4',
  '85': 'OP_5',
  '86': 'OP_6',
  '87': 'OP_7',
  '88': 'OP_8',
  '89': 'OP_9',
  '90': 'OP_10',
  '91': 'OP_11',
  '92': 'OP_12',
  '93': 'OP_13',
  '94': 'OP_14',
  '95': 'OP_15',
  '96': 'OP_16',
  '97': 'OP_NOP',
  '98': 'OP_VER',
  '99': 'OP_IF',
  '100': 'OP_NOTIF',
  '101': 'OP_VERIF',
  '102': 'OP_VERNOTIF',
  '103': 'OP_ELSE',
  '104': 'OP_ENDIF',
  '105': 'OP_VERIFY',
  '106': 'OP_RETURN',
  '107': 'OP_TOALTSTACK',
  '108': 'OP_FROMALTSTACK',
  '109': 'OP_2DROP',
  '110': 'OP_2DUP',
  '111': 'OP_3DUP',
  '112': 'OP_2OVER',
  '113': 'OP_2ROT',
  '114': 'OP_2SWAP',
  '115': 'OP_IFDUP',
  '116': 'OP_DEPTH',
  '117': 'OP_DROP',
  '118': 'OP_DUP',
  '119': 'OP_NIP',
  '120': 'OP_OVER',
  '121': 'OP_PICK',
  '122': 'OP_ROLL',
  '123': 'OP_ROT',
  '124': 'OP_SWAP',
  '125': 'OP_TUCK',
  '126': 'OP_CAT',
  '127': 'OP_SUBSTR',
  '128': 'OP_LEFT',
  '129': 'OP_RIGHT',
  '130': 'OP_SIZE',
  '131': 'OP_INVERT',
  '132': 'OP_AND',
  '133': 'OP_OR',
  '134': 'OP_XOR',
  '135': 'OP_EQUAL',
  '136': 'OP_EQUALVERIFY',
  '137': 'OP_RESERVED1',
  '138': 'OP_RESERVED2',
  '139': 'OP_1ADD',
  '140': 'OP_1SUB',
  '141': 'OP_2MUL',
  '142': 'OP_2DIV',
  '143': 'OP_NEGATE',
  '144': 'OP_ABS',
  '145': 'OP_NOT',
  '146': 'OP_0NOTEQUAL',
  '147': 'OP_ADD',
  '148': 'OP_SUB',
  '149': 'OP_MUL',
  '150': 'OP_DIV',
  '151': 'OP_MOD',
  '152': 'OP_LSHIFT',
  '153': 'OP_RSHIFT',
  '154': 'OP_BOOLAND',
  '155': 'OP_BOOLOR',
  '156': 'OP_NUMEQUAL',
  '157': 'OP_NUMEQUALVERIFY',
  '158': 'OP_NUMNOTEQUAL',
  '159': 'OP_LESSTHAN',
  '160': 'OP_GREATERTHAN',
  '161': 'OP_LESSTHANOREQUAL',
  '162': 'OP_GREATERTHANOREQUAL',
  '163': 'OP_MIN',
  '164': 'OP_MAX',
  '165': 'OP_WITHIN',
  '166': 'OP_RIPEMD160',
  '167': 'OP_SHA1',
  '168': 'OP_SHA256',
  '169': 'OP_HASH160',
  '170': 'OP_HASH256',
  '171': 'OP_CODESEPARATOR',
  '172': 'OP_CHECKSIG',
  '173': 'OP_CHECKSIGVERIFY',
  '174': 'OP_CHECKMULTISIG',
  '175': 'OP_CHECKMULTISIGVERIFY',
  '176': 'OP_NOP1',
  '177': 'OP_CHECKLOCKTIMEVERIFY',
  '178': 'OP_CHECKSEQUENCEVERIFY',
  '179': 'OP_NOP4',
  '180': 'OP_NOP5',
  '181': 'OP_NOP6',
  '182': 'OP_NOP7',
  '183': 'OP_NOP8',
  '184': 'OP_NOP9',
  '185': 'OP_NOP10',
  '252': 'OP_NULLDATA',
  '253': 'OP_PUBKEYHASH',
  '254': 'OP_PUBKEY',
  '255': 'OP_INVALIDOPCODE'
};
