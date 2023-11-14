import { BigNumber } from '@ethersproject/bignumber';
import { hexStrArrToStr, toAddress } from './utils';
import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { uint256 } from 'starknet';
export async function handleDeploy() {
  // Run logic as at the time Contract was deployed.
}

export async function handleBatchRequest({ block, tx, event, mysql }: Parameters<CheckpointWriter>[0]) {
  if (!event) return;
  if (!block) return;

  const timestamp = block.timestamp;
  const blockNumber = block.block_number;
  const nonce = event.data[0];
  const total_borrowed = uint256.uint256ToBN({low: event.data[2], high: event.data[1]});
  const total_repaid = uint256.uint256ToBN({low: event.data[4], high: event.data[3]});
  
  // post object matches fields of Post type in schema.gql
  const batch_request = {
    id: nonce,
    total_borrowed: total_borrowed.toString(),
    total_repaid: total_repaid.toString(),
    tx_hash: tx.transaction_hash,
    created_at: timestamp,
    created_at_block: blockNumber
  };

  console.log(">>> Indexing BatchRequest");

  // table names are `lowercase(TypeName)s` and can be interacted with sql
  await mysql.queryAsync('INSERT IGNORE INTO batchrequests SET ?', [batch_request]);
}

export async function handleBatchResponse({ block, tx, event, mysql }: Parameters<CheckpointWriter>[0]) {
  if (!event) return;
  if (!block) {console.log("IS EMPTY"); return;}

  const timestmap = block.timestamp;
  const blockNumber = block.block_number;
  const nonce = event.data[0];
  const total_lusd = uint256.uint256ToBN({low: event.data[2], high: event.data[1]});
  const total_eth = uint256.uint256ToBN({low: event.data[4], high: event.data[3]});

  const batch_response = {
    id: nonce,
    lusd_amount: total_lusd.toString(),
    eth_amount: total_eth.toString(),
    tx_hash: tx.transaction_hash,
    created_at: timestmap,
    created_at_block: blockNumber
  };

  console.log(">>> Indexing BatchResponse");

  await mysql.queryAsync('INSERT IGNORE INTO batchresponses SET ?', [batch_response]);
}
