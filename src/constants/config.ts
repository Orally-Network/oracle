const isDevelopment = false; // import.meta.env.VITE_NODE_ENV === 'development'
const isStaging = import.meta.env.VITE_MODE === 'staging';

const HOST = 'https://ic0.app';
const DOMAIN = isDevelopment ? 'localhost:4943' : 'icp0.io';

export default {
  isDevelopment,
  isStaging,
  HOST,
  DOMAIN,
  GOOGLE_ANALYTICS_TRACKING_CODE: import.meta.env.VITE_GOOGLE_ANALYTICS_TRACKING_CODE,
  ROLLBAR_ACCESS_TOKEN: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  ALCHEMY_API_KEY: import.meta.env.VITE_ALCHEMY_API_KEY,
  INFURA_API_KEY: import.meta.env.VITE_INFURA_API_KEY,
  env: import.meta.env.VITE_ENV,
  ETHERSCAN_API_KEY: import.meta.env.VITE_ETHERSCAN_API_KEY,

  THE_GRAPH_URL: import.meta.env.VITE_THE_GRAPH_URL,

  sybilCansiters: [
    'wth3l-tiaaa-aaaap-aa5uq-cai',
    'xywyw-qiaaa-aaaad-aaema-cai',
    'tysiw-qaaaa-aaaak-qcikq-cai',
  ],

  pythia_canister_id: isStaging ? 'xmz4o-gqaaa-aaaag-qcjva-cai' : 'ettff-uaaaa-aaaag-abpcq-cai',
  sybil_canister_id: isStaging ? 'tysiw-qaaaa-aaaak-qcikq-cai' : 'wth3l-tiaaa-aaaap-aa5uq-cai',
  // sybil_canister_id: isStaging ? 'xywyw-qiaaa-aaaad-aaema-cai' : 'wth3l-tiaaa-aaaap-aa5uq-cai',
  apollo_canister_id: isStaging ? 'ndeka-riaaa-aaaak-afmaq-cai' : 'iuq3c-pqaaa-aaaag-qdcva-cai',

  weatherSource1Key: import.meta.env.VITE_WEATHER_SOURCE_1_KEY,
  weatherSource2Key: import.meta.env.VITE_WEATHER_SOURCE_2_KEY,
  weatherSource3Key: import.meta.env.VITE_WEATHER_SOURCE_3_KEY,

  zeroXApiKey: import.meta.env.VITE_ZERO_X_API_KEY,

  wagmiConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,

  liFiSdkIntegrator: import.meta.env.VITE_LIFI_SDK_INTEGRATOR,
  liFiApiUrl: 'https://li.quest/v1',
};
