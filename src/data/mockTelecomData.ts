import { CommercialTariffPlan, SubscriberAccount, ActiveSession, CdrRecord } from '../types/telecom';

export const INITIAL_TARIFFS: CommercialTariffPlan[] = [
  {
    planId: 'PLAN-5G-VOLTE-CONVERGED-PRO',
    name: '5G True Unlimited SA + VoLTE Sovereign Bundle',
    description: 'Converged commercial bundle with dedicated 5G eMBB slice, On-Net & Off-Net HD voice, Off-Peak night quota, and main currency wallet.',
    targetSegment: 'Premium Consumer & Prosumer',
    accountTypeSupported: 'HYBRID',
    monthlyRecurringFee: 29.99,
    currency: 'USD',
    bucketCascade: [
      'PROMOTIONAL_GRANT',
      'SLICE_SPECIFIC',
      'DATA_OFFPEAK',
      'DATA_GENERAL',
      'MONETARY_WALLET'
    ],
    ratingGroups: [
      {
        ratingGroup: 100,
        name: '5G eMBB Sliced Broadband Data',
        description: '3GPP 5QI 9 high-speed data with dynamic SCUR unit reservation via Nchf.',
        unitType: 'BYTES',
        unitPriceMonetary: 0.05,
        unitsPerPrice: 524288000, // 500 MB
        defaultQuotaGrant: 104857600, // 100 MB grant
        validityTimeSeconds: 300,
        quotaHoldingTimeSeconds: 60,
        triggers: ['QUOTA_EXHAUSTED', 'VALIDITY_TIME_ELAPSED', 'QOS_CHANGE', 'FINAL'],
        snssai: '1-000001',
        applicableBucketTypes: ['PROMOTIONAL_GRANT', 'SLICE_SPECIFIC', 'DATA_GENERAL', 'MONETARY_WALLET']
      },
      {
        ratingGroup: 110,
        name: 'Midnight / Off-Peak Data (00:00 - 06:00)',
        description: 'Zero-rated or high-allowance night owl volume.',
        unitType: 'BYTES',
        unitPriceMonetary: 0.01,
        unitsPerPrice: 1073741824, // 1 GB
        defaultQuotaGrant: 524288000, // 500 MB
        validityTimeSeconds: 600,
        quotaHoldingTimeSeconds: 120,
        triggers: ['QUOTA_EXHAUSTED', 'VALIDITY_TIME_ELAPSED', 'FINAL'],
        applicableBucketTypes: ['DATA_OFFPEAK', 'DATA_GENERAL']
      },
      {
        ratingGroup: 200,
        name: 'IMS VoLTE On-Net Carrier Voice',
        description: '3GPP 5QI 1 GBR carrier voice within telco network (Diameter Ro or Nchf).',
        unitType: 'SECONDS',
        unitPriceMonetary: 0.01,
        unitsPerPrice: 60,
        defaultQuotaGrant: 180, // 3 minutes grant
        validityTimeSeconds: 600,
        quotaHoldingTimeSeconds: 120,
        triggers: ['QUOTA_EXHAUSTED', 'VALIDITY_TIME_ELAPSED', 'FINAL'],
        applicableBucketTypes: ['VOICE_ONNET', 'MONETARY_WALLET']
      },
      {
        ratingGroup: 201,
        name: 'IMS VoLTE Off-Net Interconnect Voice',
        description: '3GPP 5QI 1 voice terminating to other national carriers.',
        unitType: 'SECONDS',
        unitPriceMonetary: 0.02,
        unitsPerPrice: 60,
        defaultQuotaGrant: 180,
        validityTimeSeconds: 600,
        quotaHoldingTimeSeconds: 120,
        triggers: ['QUOTA_EXHAUSTED', 'VALIDITY_TIME_ELAPSED', 'FINAL'],
        applicableBucketTypes: ['VOICE_OFFNET', 'MONETARY_WALLET']
      },
      {
        ratingGroup: 205,
        name: 'International ISD Voice Calling',
        description: 'High-definition voice calling to international destinations.',
        unitType: 'SECONDS',
        unitPriceMonetary: 0.25,
        unitsPerPrice: 60,
        defaultQuotaGrant: 60,
        validityTimeSeconds: 300,
        quotaHoldingTimeSeconds: 60,
        triggers: ['QUOTA_EXHAUSTED', 'FINAL'],
        applicableBucketTypes: ['VOICE_ISD', 'MONETARY_WALLET']
      },
      {
        ratingGroup: 300,
        name: 'SMS & P2P Messaging (IEC)',
        description: 'Immediate Event Charging for national & international SMS.',
        unitType: 'COUNT',
        unitPriceMonetary: 0.02,
        unitsPerPrice: 1,
        defaultQuotaGrant: 1,
        validityTimeSeconds: 0,
        quotaHoldingTimeSeconds: 0,
        triggers: ['FINAL'],
        applicableBucketTypes: ['MONETARY_WALLET']
      }
    ],
    thresholdTriggers: [
      { percentage: 50, action: 'NOTIFY_USER' },
      { percentage: 80, action: 'ALERT_N28_PCF' },
      { percentage: 100, action: 'THROTTLE_QOS' }
    ]
  },
  {
    planId: 'PLAN-ENTERPRISE-POSTPAID-FLEX',
    name: 'Enterprise VIP Postpaid Pooled Fleet',
    description: 'Postpaid corporate bundle with zero-balance pass-through, monthly credit ceiling, and automated unbilled usage tracking.',
    targetSegment: 'Corporate & Government Fleets',
    accountTypeSupported: 'POSTPAID',
    monthlyRecurringFee: 79.99,
    currency: 'USD',
    bucketCascade: ['SLICE_SPECIFIC', 'DATA_GENERAL', 'MONETARY_WALLET'],
    ratingGroups: [
      {
        ratingGroup: 100,
        name: 'Enterprise 5G Data Priority',
        description: '5QI 6 mission critical broadband data with postpaid billing.',
        unitType: 'BYTES',
        unitPriceMonetary: 0.03,
        unitsPerPrice: 1073741824,
        defaultQuotaGrant: 209715200,
        validityTimeSeconds: 600,
        quotaHoldingTimeSeconds: 120,
        triggers: ['QUOTA_EXHAUSTED', 'VALIDITY_TIME_ELAPSED', 'FINAL'],
        applicableBucketTypes: ['DATA_GENERAL', 'MONETARY_WALLET']
      },
      {
        ratingGroup: 200,
        name: 'Enterprise Unlimited National Voice',
        description: 'Unlimited VoLTE/VoNR on-net and off-net calls.',
        unitType: 'SECONDS',
        unitPriceMonetary: 0.01,
        unitsPerPrice: 60,
        defaultQuotaGrant: 300,
        validityTimeSeconds: 900,
        quotaHoldingTimeSeconds: 180,
        triggers: ['QUOTA_EXHAUSTED', 'FINAL'],
        applicableBucketTypes: ['VOICE_ONNET', 'VOICE_OFFNET']
      }
    ],
    thresholdTriggers: [
      { percentage: 70, action: 'NOTIFY_USER' },
      { percentage: 90, action: 'ALERT_N28_PCF' },
      { percentage: 100, action: 'ALERT_N28_PCF' }
    ]
  }
];

export const INITIAL_SUBSCRIBERS: SubscriberAccount[] = [
  {
    accountId: 'ACC-PREPAID-101',
    tenantId: 'TELCO-NATIONAL-01',
    accountType: 'PREPAID',
    tier: 'CONSUMER_PREPAID',
    msisdn: '+919820012345',
    imsi: '404450123456789',
    supi: 'imsi-404450123456789',
    gpsi: 'msisdn-919820012345',
    pei: '8629100412345670',
    sipUri: 'sip:+919820012345@ims.mnc045.mcc404.3gppnetwork.org',
    hardwareCodec: 'EVS-SWB 24.4kbps (Enhanced Voice Services)',
    sa5gCapable: true,
    deviceModel: 'Samsung Galaxy S25 5G SA',
    activePlanId: 'PLAN-5G-VOLTE-CONVERGED-PRO',
    planName: '5G True Unlimited SA + VoLTE Sovereign Bundle',
    status: 'ACTIVE',
    buckets: [
      {
        id: 'BKT-PRM-01',
        name: 'Welcome 5G Promo Grant',
        type: 'PROMOTIONAL_GRANT',
        category: 'PROMOTIONAL_GRANT',
        unit: 'BYTES',
        initialValue: 5368709120, // 5 GB
        currentValue: 1073741824, // 1 GB left
        reservedValue: 104857600, // 100 MB currently held in SCUR
        priorityOrder: 1, // Draw first
        expiryTimestamp: '2026-11-01T00:00:00Z',
      },
      {
        id: 'BKT-SLC-01',
        name: 'Dedicated 5G eMBB Slice Quota',
        type: 'SLICE_SPECIFIC',
        category: 'DATA_SLICE',
        unit: 'BYTES',
        initialValue: 10737418240, // 10 GB
        currentValue: 8589934592, // 8 GB left
        reservedValue: 0,
        priorityOrder: 2,
        sliceId: '1-000001',
      },
      {
        id: 'BKT-DAT-GEN',
        name: 'General 4G/5G Data Volume',
        type: 'DATA_GENERAL',
        category: 'DATA_GENERAL',
        unit: 'BYTES',
        initialValue: 53687091200, // 50 GB
        currentValue: 48318382080, // ~45 GB left
        reservedValue: 0,
        priorityOrder: 3,
      },
      {
        id: 'BKT-DAT-NIGHT',
        name: 'Off-Peak Night Owl Data (00-06h)',
        type: 'DATA_OFFPEAK',
        category: 'DATA_OFFPEAK',
        unit: 'BYTES',
        initialValue: 21474836480, // 20 GB
        currentValue: 19327352832, // 18 GB left
        reservedValue: 0,
        priorityOrder: 2,
        timeWindow: { startHour: 0, endHour: 6 }
      },
      {
        id: 'BKT-V-ONNET',
        name: 'VoLTE On-Net Calling Pool',
        type: 'VOICE_ONNET',
        category: 'VOICE_ONNET',
        unit: 'SECONDS',
        initialValue: 180000, // 50 hours
        currentValue: 172800, // 48 hours left
        reservedValue: 180, // 3 min held
        priorityOrder: 1,
      },
      {
        id: 'BKT-V-OFFNET',
        name: 'National Off-Net Calling Allowance',
        type: 'VOICE_OFFNET',
        category: 'VOICE_OFFNET',
        unit: 'SECONDS',
        initialValue: 36000, // 10 hours
        currentValue: 32400, // 9 hours left
        reservedValue: 0,
        priorityOrder: 1,
      },
      {
        id: 'BKT-V-ISD',
        name: 'International ISD Calling Minutes',
        type: 'VOICE_ISD',
        category: 'VOICE_ISD',
        unit: 'SECONDS',
        initialValue: 3600, // 60 mins
        currentValue: 2400, // 40 mins left
        reservedValue: 0,
        priorityOrder: 1,
      },
      {
        id: 'BKT-CORE-WALLET',
        name: 'Main Prepaid Cash Wallet',
        type: 'MONETARY_WALLET',
        category: 'MONETARY_WALLET',
        unit: 'MONETARY',
        initialValue: 50.00,
        currentValue: 28.50,
        reservedValue: 0,
        priorityOrder: 5,
        currency: 'USD',
      },
    ],
    usageCounters: {
      dataBytesCycle: 15728640000,
      voiceSecondsCycle: 14400,
      smsCountCycle: 42,
      rolling24hBytes: 2147483648,
      peakHourBytes: 838860800,
      offPeakBytes: 2147483648,
    },
    policyCounters: {
      statusN28: 'NORMAL',
      active5QI: 9,
    },
  },
  {
    accountId: 'ACC-POSTPAID-202',
    tenantId: 'TELCO-NATIONAL-01',
    accountType: 'POSTPAID',
    tier: 'CONSUMER_POSTPAID',
    msisdn: '+919820098765',
    imsi: '404450987654321',
    supi: 'imsi-404450987654321',
    gpsi: 'msisdn-919820098765',
    pei: '8690220399887712',
    sipUri: 'sip:+919820098765@ims.mnc045.mcc404.3gppnetwork.org',
    hardwareCodec: 'AMR-WB 12.65kbps',
    sa5gCapable: true,
    deviceModel: 'Apple iPhone 16 Pro Max',
    activePlanId: 'PLAN-ENTERPRISE-POSTPAID-FLEX',
    planName: 'Enterprise VIP Postpaid Pooled Fleet',
    status: 'ACTIVE',
    creditLimit: 150.00,
    currentUnbilledAmount: 42.80,
    billShockThresholds: [70, 90, 100],
    buckets: [
      {
        id: 'BKT-POST-DAT',
        name: 'Postpaid High-Speed 100GB Pool',
        type: 'DATA_GENERAL',
        category: 'DATA_GENERAL',
        unit: 'BYTES',
        initialValue: 107374182400, // 100 GB
        currentValue: 32212254720, // 30 GB left
        reservedValue: 104857600,
        priorityOrder: 1,
      },
      {
        id: 'BKT-POST-VOICE',
        name: 'Unlimited Postpaid National Voice',
        type: 'VOICE_ONNET',
        category: 'VOICE_ONNET',
        unit: 'SECONDS',
        initialValue: 3600000, // 1000 hours
        currentValue: 3456000,
        reservedValue: 0,
        priorityOrder: 1,
      },
      {
        id: 'BKT-POST-CREDIT',
        name: 'Postpaid Credit Facility Wallet',
        type: 'MONETARY_WALLET',
        category: 'MONETARY_WALLET',
        unit: 'MONETARY',
        initialValue: 150.00,
        currentValue: 107.20, // $150 credit limit - $42.80 unbilled
        reservedValue: 0,
        priorityOrder: 2,
        currency: 'USD',
      }
    ],
    usageCounters: {
      dataBytesCycle: 75161927680, // ~70 GB used
      voiceSecondsCycle: 28800,
      smsCountCycle: 15,
      rolling24hBytes: 5368709120,
      peakHourBytes: 2147483648,
      offPeakBytes: 1073741824,
    },
    policyCounters: {
      statusN28: 'NEAR_THRESHOLD', // At 70% threshold!
      active5QI: 9,
    },
  },
  {
    accountId: 'ACC-PREPAID-303',
    tenantId: 'TELCO-NATIONAL-01',
    accountType: 'PREPAID',
    tier: 'CONSUMER_PREPAID',
    msisdn: '+919820055443',
    imsi: '404450554433221',
    supi: 'imsi-404450554433221',
    gpsi: 'msisdn-919820055443',
    pei: '3539120811223344',
    sipUri: 'sip:+919820055443@ims.mnc045.mcc404.3gppnetwork.org',
    hardwareCodec: 'EVS-SWB',
    sa5gCapable: true,
    deviceModel: 'Google Pixel 9 Pro Fold',
    activePlanId: 'PLAN-5G-VOLTE-CONVERGED-PRO',
    planName: '5G True Unlimited SA + VoLTE Sovereign Bundle',
    status: 'ACTIVE',
    buckets: [
      {
        id: 'BKT-DEP-DAT',
        name: 'Prepaid Data Allowance (Critical 95% Depleted)',
        type: 'DATA_GENERAL',
        category: 'DATA_GENERAL',
        unit: 'BYTES',
        initialValue: 5368709120, // 5 GB
        currentValue: 268435456, // 256 MB left
        reservedValue: 104857600,
        priorityOrder: 1,
      },
      {
        id: 'BKT-DEP-VOICE',
        name: 'VoLTE Voice Allowance',
        type: 'VOICE_ONNET',
        category: 'VOICE_ONNET',
        unit: 'SECONDS',
        initialValue: 18000,
        currentValue: 1200, // 20 mins left
        reservedValue: 0,
        priorityOrder: 1,
      },
      {
        id: 'BKT-DEP-MONEY',
        name: 'Prepaid Cash Wallet (Depleted)',
        type: 'MONETARY_WALLET',
        category: 'MONETARY_WALLET',
        unit: 'MONETARY',
        initialValue: 10.00,
        currentValue: 0.40,
        reservedValue: 0,
        priorityOrder: 2,
        currency: 'USD',
      }
    ],
    usageCounters: {
      dataBytesCycle: 5100273664,
      voiceSecondsCycle: 16800,
      smsCountCycle: 3,
      rolling24hBytes: 2147483648,
      peakHourBytes: 1073741824,
      offPeakBytes: 0,
    },
    policyCounters: {
      statusN28: 'NEAR_THRESHOLD',
      active5QI: 9,
    },
  }
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    sessionId: 'chf-sess-5g-9921',
    protocol: '5G_HTTP2_JSON',
    sessionType: '5G_DATA_SCUR',
    priority: 'BEST_EFFORT_DATA',
    supi: 'imsi-404450123456789',
    msisdn: '+919820012345',
    gpsi: 'msisdn-919820012345',
    pduSessionId: 1,
    sNssai: '1-000001',
    ratingGroup: 100,
    serviceId: 1001,
    state: 'ACTIVE',
    startTime: Date.now() - 480000,
    lastReservationTime: Date.now() - 32000,
    grantedUnits: 104857600,
    consumedUnits: 348127232,
    unitType: 'BYTES',
    validityTimeSeconds: 300,
    current5QI: 9,
    latencyMs: 3.42,
    cdrId: 'CDR-5G-20261021-9921',
    history: [
      {
        timestamp: Date.now() - 480000,
        messageType: 'ChargingDataRequest [Initial]',
        protocol: 'HTTP/2 REST (Nchf/N40 via 5G SMF)',
        unitsRequested: 104857600,
        unitsGranted: 104857600,
        p99LatencyMs: 4.12,
      },
      {
        timestamp: Date.now() - 240000,
        messageType: 'ChargingDataRequest [Update - Interim]',
        protocol: 'HTTP/2 REST (Nchf/N40 via 5G SMF)',
        unitsRequested: 104857600,
        unitsGranted: 104857600,
        p99LatencyMs: 3.18,
      },
    ],
  },
  {
    sessionId: 'ims-volte-diam-4882',
    protocol: '4G_DIAMETER_RO',
    sessionType: '4G_VOLTE_VOICE',
    priority: 'CRITICAL_VOICE',
    supi: 'imsi-404450123456789',
    msisdn: '+919820012345',
    gpsi: 'msisdn-919820012345',
    diameterSessionId: 'ims-cscf.mnc045.mcc404.3gppnetwork.org;1729482910;4882',
    ratingGroup: 200,
    serviceId: 2001,
    state: 'ACTIVE',
    startTime: Date.now() - 145000,
    lastReservationTime: Date.now() - 25000,
    grantedUnits: 180,
    consumedUnits: 145,
    unitType: 'SECONDS',
    validityTimeSeconds: 600,
    current5QI: 1, // GBR VoLTE Voice
    latencyMs: 1.84,
    cdrId: 'CDR-RO-20261021-4882',
    history: [
      {
        timestamp: Date.now() - 145000,
        messageType: 'Diameter CCR [INITIAL] (CC-Request-Type=1)',
        protocol: 'Diameter Ro (IMS TAS / CSCF)',
        unitsRequested: 180,
        unitsGranted: 180,
        p99LatencyMs: 2.11,
      },
      {
        timestamp: Date.now() - 25000,
        messageType: 'Diameter CCR [UPDATE] (CC-Request-Type=2)',
        protocol: 'Diameter Ro (IMS TAS / CSCF)',
        unitsRequested: 180,
        unitsGranted: 180,
        p99LatencyMs: 1.84,
      },
    ],
  },
  {
    sessionId: 'pgw-gy-sess-3312',
    protocol: '4G_DIAMETER_GY',
    sessionType: '4G_PGW_DATA_GY',
    priority: 'BEST_EFFORT_DATA',
    supi: 'imsi-404450987654321',
    msisdn: '+919820098765',
    gpsi: 'msisdn-919820098765',
    diameterSessionId: 'pgw01.lte.mnc045.mcc404.3gppnetwork.org;3312;881',
    ratingGroup: 100,
    serviceId: 1001,
    state: 'ACTIVE',
    startTime: Date.now() - 360000,
    lastReservationTime: Date.now() - 60000,
    grantedUnits: 52428800,
    consumedUnits: 209715200,
    unitType: 'BYTES',
    validityTimeSeconds: 600,
    current5QI: 9,
    latencyMs: 2.12,
    cdrId: 'CDR-GY-20261021-3312',
    history: [
      {
        timestamp: Date.now() - 360000,
        messageType: 'Diameter CCR [INITIAL] Gy',
        protocol: 'Diameter Gy (4G PGW)',
        unitsRequested: 52428800,
        unitsGranted: 52428800,
        p99LatencyMs: 2.34,
      }
    ]
  }
];

export const INITIAL_CDRS: CdrRecord[] = [
  {
    cdrId: 'CDR-5G-HIST-001',
    sessionId: 'chf-sess-5g-8812',
    supi: 'imsi-404450987654321',
    msisdn: '+919820098765',
    gpsi: 'msisdn-919820098765',
    protocol: '5G_HTTP2_JSON',
    ratingGroup: 100,
    chargingMethod: 'SCUR',
    totalUnitsConsumed: 1610612736,
    unitType: 'BYTES',
    totalChargeMonetary: 0.15,
    currency: 'USD',
    sNssai: '1-000001',
    causeForTermination: 'USER_INITIATED_RELEASE (Normal PDU Session Teardown)',
    timestamp: '2026-10-21T03:52:10Z',
  },
  {
    cdrId: 'CDR-RO-HIST-002',
    sessionId: 'ims-volte-diam-4211',
    supi: 'imsi-404450123456789',
    msisdn: '+919820012345',
    gpsi: 'msisdn-919820012345',
    protocol: '4G_DIAMETER_RO',
    ratingGroup: 200,
    chargingMethod: 'SCUR',
    totalUnitsConsumed: 540,
    unitType: 'SECONDS',
    totalChargeMonetary: 0.18,
    currency: 'USD',
    causeForTermination: 'SIP_BYE_RECEIVED (Call Ended by Caller)',
    timestamp: '2026-10-21T03:45:00Z',
  },
];
