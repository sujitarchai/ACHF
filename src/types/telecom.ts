/**
 * 3GPP Converged Charging Function (CHF / OCS) Domain Types
 * Standards: 3GPP TS 32.290, TS 32.291, TS 32.299 (Gy/Ro), TS 29.594 (N28), TS 29.512
 */

export type ProtocolType = '5G_HTTP2_JSON' | '4G_DIAMETER_RO' | '4G_DIAMETER_GY' | 'N28_HTTP2_JSON';

export type SessionType = 
  | '5G_DATA_SCUR' 
  | '4G_PGW_DATA_GY'
  | '4G_VOLTE_VOICE' 
  | '5G_VONR_VOICE' 
  | 'SMS_IEC' 
  | 'SLICE_ECUR';

export type SessionState = 'ACTIVE' | 'TERMINATED' | 'QUOTA_HOLD' | 'POLICY_THROTTLED' | 'PENDING_INITIAL';

export type PriorityLevel = 'CRITICAL_VOICE' | 'HIGH_PRIORITY_SLICE' | 'BEST_EFFORT_DATA';

export type BucketUnit = 'BYTES' | 'SECONDS' | 'MONETARY' | 'COUNT';

export type BucketCategory = 
  | 'VOICE_ONNET'
  | 'VOICE_OFFNET'
  | 'VOICE_ISD'
  | 'DATA_SLICE'
  | 'DATA_GENERAL'
  | 'DATA_OFFPEAK'
  | 'DATA_APP'
  | 'PROMOTIONAL_GRANT'
  | 'MONETARY_WALLET';

export type BucketType = 
  | 'PROMOTIONAL_GRANT' 
  | 'SLICE_SPECIFIC' 
  | 'VOICE_ONNET' 
  | 'VOICE_OFFNET' 
  | 'VOICE_ISD' 
  | 'DATA_GENERAL' 
  | 'DATA_OFFPEAK' 
  | 'DATA_APP' 
  | 'PRIMARY_ACCOUNT' 
  | 'MONETARY_WALLET';

export interface BalanceBucket {
  id: string;
  name: string;
  type: BucketType;
  category: BucketCategory;
  unit: BucketUnit;
  initialValue: number;
  currentValue: number;
  reservedValue: number;
  priorityOrder: number; // 1 = highest precedence (drawn first)
  currency?: string;
  sliceId?: string; // S-NSSAI if slice-specific (e.g. 1-000001)
  expiryTimestamp?: string;
  timeWindow?: {
    startHour: number; // e.g. 0 for offpeak midnight
    endHour: number;   // e.g. 6 for 6am
  };
}

export type AccountClassification = 'PREPAID' | 'POSTPAID';

export interface SubscriberAccount {
  accountId: string;
  tenantId: string;
  accountType: AccountClassification;
  tier: 'CONSUMER_PREPAID' | 'CONSUMER_POSTPAID' | 'ENTERPRISE_VIP' | 'IOT_M2M';
  
  // Full 3GPP Identity Stack
  msisdn: string; // Dialable E.164 (e.g. +919820012345 or +14155552671)
  imsi: string;   // 15-digit IMSI (e.g. 404450123456789)
  supi: string;   // 5G SA SUPI (e.g. imsi-404450123456789)
  gpsi: string;   // GPSI (e.g. msisdn-919820012345)
  pei: string;    // IMEISV (e.g. 8629100412345670)
  sipUri: string; // IMS VoLTE/VoNR SIP URI

  // Hardware Metadata
  hardwareCodec?: string; // EVS-SWB, AMR-WB
  sa5gCapable: boolean;
  deviceModel?: string;

  // Commercial Bundle & Billing Setup
  activePlanId: string;
  planName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'THROTTLED';
  
  // Postpaid specific credit limits
  creditLimit?: number; // e.g., $150.00
  currentUnbilledAmount?: number; // accumulated consumption
  billShockThresholds?: number[]; // [50, 80, 100]

  // Hierarchical Multi-Bucket Allowances
  buckets: BalanceBucket[];

  // Real-time Usage Counters
  usageCounters: {
    dataBytesCycle: number;
    voiceSecondsCycle: number;
    smsCountCycle: number;
    rolling24hBytes: number;
    peakHourBytes: number;
    offPeakBytes: number;
  };

  // 3GPP TS 29.594 (N28) Policy Counters
  policyCounters: {
    statusN28: 'NORMAL' | 'NEAR_THRESHOLD' | 'BREACHED';
    active5QI: number; // 1 (VoLTE), 9 (Broadband eMBB), 80 (Throttled 128kbps)
    redirectUrl?: string;
  };
}

export interface RatingGroupConfig {
  ratingGroup: number;
  serviceId?: number;
  name: string;
  description: string;
  unitType: BucketUnit;
  unitPriceMonetary: number;
  unitsPerPrice: number;
  defaultQuotaGrant: number;
  validityTimeSeconds: number;
  quotaHoldingTimeSeconds: number;
  triggers: Array<'QUOTA_EXHAUSTED' | 'VALIDITY_TIME_ELAPSED' | 'QOS_CHANGE' | 'LOCATION_CHANGE' | 'FINAL'>;
  snssai?: string;
  applicableBucketTypes: BucketType[];
}

export interface CommercialTariffPlan {
  planId: string;
  name: string;
  description: string;
  targetSegment: string;
  accountTypeSupported: 'PREPAID' | 'POSTPAID' | 'HYBRID';
  monthlyRecurringFee: number;
  currency: string;
  ratingGroups: RatingGroupConfig[];
  thresholdTriggers: {
    percentage: number;
    action: 'NOTIFY_USER' | 'ALERT_N28_PCF' | 'THROTTLE_QOS' | 'BLOCK_SERVICE';
  }[];
  bucketCascade: BucketType[];
}

export interface ActiveSession {
  sessionId: string;
  protocol: ProtocolType;
  sessionType: SessionType;
  priority: PriorityLevel;
  supi: string;
  msisdn: string;
  gpsi: string;
  pduSessionId?: number;
  diameterSessionId?: string;
  sNssai?: string;
  ratingGroup: number;
  serviceId?: number;
  state: SessionState;
  startTime: number;
  lastReservationTime: number;
  grantedUnits: number;
  consumedUnits: number;
  unitType: BucketUnit;
  validityTimeSeconds: number;
  current5QI: number;
  latencyMs: number;
  cdrId: string;
  history: Array<{
    timestamp: number;
    messageType: string;
    protocol: string;
    unitsRequested: number;
    unitsGranted: number;
    p99LatencyMs: number;
  }>;
}

export interface RealtimeMetric {
  tps: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeSessions5G: number;
  activeSessions4G: number;
  priorityQueueDepth: number;
  bestEffortQueueDepth: number;
  throttledSessionsCount: number;
  n28BreachAlertsSent: number;
  totalCdrCount: number;
}

export interface CdrRecord {
  cdrId: string;
  sessionId: string;
  supi: string;
  msisdn: string;
  gpsi: string;
  protocol: ProtocolType;
  ratingGroup: number;
  chargingMethod: 'SCUR' | 'ECUR' | 'IEC';
  totalUnitsConsumed: number;
  unitType: BucketUnit;
  totalChargeMonetary: number;
  currency: string;
  sNssai?: string;
  causeForTermination: string;
  timestamp: string;
}

export interface GatewayEventLog {
  id: string;
  timestamp: string;
  protocol: ProtocolType;
  source: 'SMF' | 'IMS_CSCF' | 'PGW' | 'PCF';
  messageName: string;
  priority: PriorityLevel;
  supi: string;
  rg: number;
  latencyMs: number;
  status: 'SUCCESS' | 'THROTTLED' | 'QUOTA_DENIED';
  summary: string;
}
