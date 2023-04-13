use ic_cdk::export::candid::{CandidType, Deserialize};
use rs_merkle::{Hasher, MerkleTree, MerkleProof};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::collections::HashMap;
use sha3::{Digest, Keccak256};
use hex;

type Hash = [u8; 32];

#[derive(Clone, Debug, Serialize, SerdeDeserialize, CandidType, PartialEq)]
pub struct AssetData {
    pub symbol: String,
    pub price: u64,
    pub timestamp: u64,
    pub decimals: u64,
}

impl AssetData {
    fn to_leaf(&self) -> [u8; 32] {
        let mut buffer = Vec::new();
        buffer.extend_from_slice(self.symbol.as_bytes());
        buffer.extend_from_slice(&self.price.to_be_bytes());
        buffer.extend_from_slice(&self.timestamp.to_be_bytes());
        buffer.extend_from_slice(&self.decimals.to_be_bytes());
        
        Keccak256Algorithm::hash(&buffer)
    }
}

#[derive(Clone)]
pub struct Keccak256Algorithm {}

impl Hasher for Keccak256Algorithm {
    type Hash = [u8; 32];
    
    fn hash(data: &[u8]) -> Hash {
        let mut hasher = Keccak256::new();
    
        hasher.update(data.as_ref());
    
        hasher.finalize().into()
    }
}

// Define the AssetDataStore structure
pub struct AssetDataStore {
    merkle_tree: MerkleTree<Keccak256Algorithm>,
    data_store: HashMap<String, AssetData>,
    symbol_index: HashMap<String, usize>,
}

impl AssetDataStore {
    pub fn new() -> Self {
        Self {
            merkle_tree: MerkleTree::new(),
            data_store: HashMap::new(),
            symbol_index: HashMap::new(),
        }
    }
    
    pub fn add_batch_asset_data(&mut self, batch_asset_data: Vec<AssetData>) {
        let mut batch_data = Vec::new();
        
        for asset_data in batch_asset_data {
            let asset_data_hash = asset_data.to_leaf();
            
            let index = self.data_store.len();
            self.data_store.insert(asset_data.symbol.clone(), asset_data.clone());
            self.symbol_index.insert(asset_data.symbol.clone(), index);
            
            batch_data.push(asset_data_hash);
        }
        
        self.merkle_tree.append(&mut batch_data);
        // self.merkle_tree.commit();
    }
    
    pub fn commit(&mut self) {
        self.merkle_tree.commit();
    }
    
    pub fn clear(&mut self) {
        self.merkle_tree = MerkleTree::new();
        self.data_store = HashMap::new();
        self.symbol_index = HashMap::new();
    }
    
    // todo: get_asset_data_batch
    pub fn get_asset_data(&self, symbol: &str) -> Option<&AssetData> {
        self.data_store.get(symbol)
    }
    
    pub fn get_root(&self) -> Option<Hash> {
        self.merkle_tree.root()
    }
    
    pub fn get_root_hex(&self) -> Option<String> {
        self.merkle_tree.root_hex()
    }
    
    pub fn get_uncommitted_root(&self) -> Option<Hash> {
        self.merkle_tree.uncommitted_root()
    }
    
    pub fn get_uncommitted_root_hex(&self) -> Option<String> {
        self.merkle_tree.uncommitted_root_hex()
    }
    
    // todo: implement generate_proof_batch
    pub fn generate_proof(&self, symbol: &str) -> Option<Vec<u8>> {
        let index = self.symbol_index.get(symbol)?;
        
        println!("index: {:?}", index);
        // println!("proof(1): {:?}", self.merkle_tree.proof(&[*index]).proof_hashes());
        // println!("proof(1): {:?}", self.merkle_tree.proof(&[*index]).proof_hashes()[0]);
        
        // Some(self.merkle_tree.proof(&[*index]).proof_hashes()[0])
        Some(self.merkle_tree.proof(&[*index]).to_bytes())
    }
    
    pub fn generate_proof_hex(&self, symbol: &str) -> Option<Vec<String>> {
        let index = self.symbol_index.get(symbol)?;
        
        Some(self.merkle_tree.proof(&[*index]).proof_hashes_hex().clone())
    }
    
    pub fn verify_proof(&self, proof_hashes: Vec<u8>, root: Hash, symbol: &str) -> Option<bool> {
        let index = self.symbol_index.get(symbol)?;
        let asset_data = self.data_store.get(symbol)?;
        let leaf = asset_data.to_leaf();
        
        let proof = MerkleProof::<Keccak256Algorithm>::from_bytes(proof_hashes.as_slice()).ok()?;
        
        println!("asset_data: {:?}", asset_data);
        println!("symbol: {:?}", symbol);
        println!("proof(2): {:?}", proof.proof_hashes());
        println!("root: {:?}", root);
    
        // let proof_hex = hex::encode(proof.proof_hashes_hex());
        println!("proof_hex: {:?}", proof.proof_hashes_hex());
        let root_hex = hex::encode(root);
        println!("root_hex: {:?}", root_hex);
        
        println!("leaf: {:?}", hex::encode(leaf));
        
        Some(proof.verify(root, &[*index], &[leaf], self.data_store.len()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    fn create_sample_data() -> Vec<AssetData> {
        vec![
            AssetData {
                symbol: "LTC".to_string(),
                price: 22,
                timestamp: 1_000_003,
                decimals: 2,
            },
            AssetData {
                symbol: "BTC".to_string(),
                price: 45000,
                timestamp: 1_000_000,
                decimals: 2,
            },
            AssetData {
                symbol: "ICP".to_string(),
                price: 10,
                timestamp: 1_000_009,
                decimals: 2,
            },
            AssetData {
                symbol: "ETH".to_string(),
                price: 3000,
                timestamp: 1000000,
                decimals: 2,
            },
            AssetData {
                symbol: "WWW".to_string(),
                price: 300,
                timestamp: 1_000_010,
                decimals: 2,
            },
        ]
    }
    
    #[test]
    fn test_add_batch_asset_data() {
        let mut store = AssetDataStore::new();
        let data = create_sample_data();
        
        store.add_batch_asset_data(data.clone());
        
        assert_eq!(store.get_asset_data("BTC"), Some(&data[1]));
        assert_eq!(store.get_asset_data("ETH"), Some(&data[3]));
    }
    
    #[test]
    fn test_generate_and_verify_proof() {
        let mut store = AssetDataStore::new();
        let data = create_sample_data();
        
        store.add_batch_asset_data(data.clone());
        
        let root = store.get_root().unwrap();
        
        let proof_btc = store.generate_proof("BTC").unwrap();
        let proof_eth = store.generate_proof("ETH").unwrap();
        let proof_icp = store.generate_proof("ICP").unwrap();
        
        assert_eq!(
            store.verify_proof(proof_btc, root, "BTC"),
            Some(true)
        );
        assert_eq!(
            store.verify_proof(proof_eth, root, "ETH"),
            Some(true)
        );
        assert_eq!(
            store.verify_proof(proof_icp, root, "ICP"),
            Some(true)
        );
    }
}
