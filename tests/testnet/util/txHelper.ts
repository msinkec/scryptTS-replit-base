
import { bsv, UTXO } from 'scrypt-ts';
import { randomBytes } from 'crypto';
import { privateKey } from './privateKey'
import axios from 'axios';


const API_PREFIX = 'https://api.whatsonchain.com/v1/bsv/test'

export const inputSatoshis = 10000;

export const inputIndex = 0;

export const dummyUTXO = {
  txId: randomBytes(32).toString('hex'),
  outputIndex: 0,
  script: '',   // placeholder
  satoshis: inputSatoshis
};

export async function fetchUtxos(address: string = privateKey.toAddress().toString()): Promise<UTXO[]> {
  const url = `${API_PREFIX}/address/${address}/unspent`;
  let {
    data: utxos
  } = await axios.get(url)
  return utxos.map((utxo: any) => ({
    txId: utxo.tx_hash,
    outputIndex: utxo.tx_pos,
    satoshis: utxo.value,
    script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
  }))
}

export function newTx(utxos?: Array<UTXO>) {
  if (utxos) {
    return new bsv.Transaction().from(utxos);
  }
  return new bsv.Transaction().from(dummyUTXO);
}

export async function sendTx(tx: bsv.Transaction): Promise<string> {
  try {
    const {
      data: txid
    } = await axios.post(`${API_PREFIX}/tx/raw`, {
      txhex: tx.toString()
    });
    return txid
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("sendTx error", JSON.stringify(error.response))
    }

    throw error
  }
}


export const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, seconds * 1000);
  })
}

export async function signAndSend(tx: bsv.Transaction, privKey: bsv.PrivateKey = privateKey, autoChange = true): Promise<bsv.Transaction> {
  if (autoChange) {
    tx.change(privKey.toAddress());
  }

  tx.sign(privKey).seal();

  try {
    await sendTx(tx);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('\x1B[31sendTx error: ', error.response?.data)
    }
    throw error
  }

  return tx;
}
