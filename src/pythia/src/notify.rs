use orally_shared::{
    types::{Subscription},
    web3::{check_balance, send_signed_transaction},
};

use crate::*;

use crate::utils::{remove_abi_from_subscription};

pub async fn notify_subscribers(chain_id: u64) {
    CHAINS.with(|chains| {
        let chains = chains.borrow();
        
        match chains.get(&chain_id) {
            Some(chain) => {
                let msg = format!("Notify subscribers: {:?}", chain_id);
                log_message(msg);
                ic_cdk::println!(msg);
                
                for subscription in chain.subscriptions.iter() {
                    if subscription.active {
                        ic_cdk::spawn(
                            notify(subscription.clone(), chain.clone())
                        );
                    } else {
                        let msg = format!("Subscription is not active: {:?}", remove_abi_from_subscription(subscription.clone()));
                        log_message(msg);
                        ic_cdk::println!(msg);
                    }
                }
            },
            None => {
                let msg = format!("Chain not found: {:?}", chain_id);
                
                log_message(msg);
                ic_cdk::println!(msg);
                ic_cdk::trap("Chain not found")
            }
        }
    });
}

pub async fn notify(subscription: Subscription, chain: Chain) -> Result<String, String> {
    let subscription = subscription.clone();
    
    let msg = format!("Notify: {:?}", remove_abi_from_subscription(subscription));
    log_message(msg);
    ic_cdk::println!(msg);
    
    // notify
    
    // check execution balance, if not enough, deactivate subscription
    let balance = orally_shared::web3::check_balance(
        subscription.address.clone(), 
        subscription.rpc.clone()
    ).await.map_err(|e| {
        log_message(e);
        ic_cdk::println!(e);
        
        // error in case insufficient fund - deactivate subscription
        CHAINS.with(|chains| {
            let mut chains = chains.borrow_mut();
            
            match chains.get_mut(&chain.chain_id) {
                Some(chain) => {
                    for s in chain.subscriptions.iter_mut() {
                        if s.id == subscription.id {
                            s.active = false;
                        }
                    }
                    
                    let msg = format!("Subscription deactivated: {:?}", remove_abi_from_subscription(subscription));
                    log_message(msg);
                    ic_cdk::println!(msg);
                    
                    // todo: check if this trap finishes only one subscription execution
                    ic_cdk::trap("Insufficient fund");
                },
                None => {
                    let msg = format!("Chain not found: {:?}", subscription.chain_id);
                    
                    log_message(msg);
                    ic_cdk::println!(msg);
                    ic_cdk::trap("Chain not found")
                }
            }
        });
    }).unwrap();
    
    // send transaction
    let tx_hash = send_signed_transaction(
        chain.rpc.clone(),
        chain.chain_id.clone(),
        
        // todo: change it to state or smth connected to environment
        Some("qsgjb-riaaa-aaaaa-aaaga-cai".to_string()),
        None,
        subscription.clone(),
        // todo: could be with randomness
        data: None,
    ).await.map_err(|e| {
        log_message(e.clone());
        ic_cdk::println!(e);
        
        Err(e)
    }).unwrap();
    
    Ok(tx_hash)
}
