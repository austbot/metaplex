
mod utils;

use std::convert::TryFrom;
use utils::*;
use hex::FromHex;
use metaplex_token_metadata::instruction::MetadataInstruction;
use tokio::test;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::msg;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

#[tokio::test(flavor = "multi_thread")]
async fn fail_edition_already_initialized() {
    // //
    // // let client = solana_client::rpc_client::RpcClient::new(String::from("https://api.mainnet-beta.solana.com"));
    // // let gun = Pubkey::from_str("G5RrTPyNaLtzAmCVj4y1fWHqbRjqK4ak4c65eUcyvVFQ").unwrap();
    // // let res = client.get_account_data(&gun).unwrap();
    // // println!("{}", res.len());
    // // let r =  M::try_from_slice(res.as_slice()).unwrap();
    //
    //
    // let p = Pubkey::from_str("BDnvgKqRVNLhykhEZwkQ5azsWdSb27JHub2G7B2EsAA1");
    // println!("{}",p.unwrap().is_on_curve());


    let mut bytes = [0u8; 297];
  //let inputHEX = b"0010000000456c657068616e745f45542023333339000000003f00000068747470733a2f2f617277656176652e6e65742f72552d726e5849704b7a7a4e6e64642d5f4364574156387333575163745967546b4164667667584648316bf401010100000097dbc45f75501e8b1487026575b931b0d098c934ea09dd2297573a88bb7f420e016400";
    let inputHEX = b"002000000030310000000000000000000000000000000000000000000000000000000000000a00000041534349540000000000c800000068747470733a2f2f617277656176652e6e65742f6f372d626939645569785269316c58635878617447666b55426d6675515033384f3471367932775370746b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000101000000538e304c4e11fbc3be80988bad217c599ecb76f29b5980d859e7dcfb49e3ae33016401";
    hex::decode_to_slice(inputHEX, &mut bytes).unwrap();
    let instruction = MetadataInstruction::try_from_slice(&bytes).unwrap();
    match instruction {
        MetadataInstruction::CreateMetadataAccount(args) => {
            msg!("Instruction: Create Metadata Accounts");
            println!("{:#?}", args)

        }
        MetadataInstruction::UpdateMetadataAccount(args) => {
            msg!("Instruction: Update Metadata Accounts");

        }
        MetadataInstruction::DeprecatedCreateMasterEdition(args) => {
            msg!("Instruction: Deprecated Create Master Edition");

        }
        MetadataInstruction::DeprecatedMintNewEditionFromMasterEditionViaPrintingToken => {
            msg!("Instruction: Deprecated Mint New Edition from Master Edition Via Token");

        }
        MetadataInstruction::UpdatePrimarySaleHappenedViaToken => {
            msg!("Instruction: Update primary sale via token");

        }
        MetadataInstruction::DeprecatedSetReservationList(args) => {
            msg!("Instruction: Deprecated Set Reservation List");

        }
        MetadataInstruction::DeprecatedCreateReservationList => {
            msg!("Instruction: Deprecated Create Reservation List");

        }
        MetadataInstruction::SignMetadata => {
            msg!("Instruction: Sign Metadata");

        }
        MetadataInstruction::DeprecatedMintPrintingTokensViaToken(args) => {
            msg!("Instruction: Deprecated Mint Printing Tokens Via Token");

        }
        MetadataInstruction::DeprecatedMintPrintingTokens(args) => {
            msg!("Instruction: Deprecated Mint Printing Tokens");

        }
        MetadataInstruction::CreateMasterEdition(args) => {
            msg!("Instruction: Create Master Edition");

        }
        MetadataInstruction::MintNewEditionFromMasterEditionViaToken(args) => {
            msg!("Instruction: Mint New Edition from Master Edition Via Token");

        }
        MetadataInstruction::ConvertMasterEditionV1ToV2 => {
            msg!("Instruction: Convert Master Edition V1 to V2");

        }
        MetadataInstruction::MintNewEditionFromMasterEditionViaVaultProxy(args) => {
            msg!("Instruction: Mint New Edition from Master Edition Via Vault Proxy");

        }
        MetadataInstruction::PuffMetadata => {
            msg!("Instruction: Puff Metadata");

        }
    }
    ()
}
