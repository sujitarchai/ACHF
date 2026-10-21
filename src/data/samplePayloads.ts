/**
 * Technical JSON Schemas & Production Call Samples
 * Aligned with 3GPP TS 32.290, TS 32.291 (Nchf), TS 32.299 (Diameter Ro/Gy), and TS 29.594 (N28)
 */

export interface SamplePayloadItem {
  id: string;
  title: string;
  standard: string;
  description: string;
  protocol: string;
  direction: string;
  jsonContent: object;
}

export const PRODUCTION_SAMPLE_PAYLOADS: Record<string, SamplePayloadItem> = {
  subscriberProvisioning: {
    id: 'subscriber-provisioning',
    title: '1. Unified Subscriber Provisioning Payload (Prepaid & Postpaid)',
    standard: '3GPP TS 32.290 / OCS CRM Provisioning API',
    description: 'Registers subscriber device with complete identifier stack (MSISDN, IMSI, SUPI, GPSI, SIP URI, PEI), account classification (Prepaid vs. Postpaid with credit limit), and hardware codec capabilities.',
    protocol: 'REST JSON / CRM Provisioning Gateway',
    direction: 'BSS/CRM -> CHF Core Database',
    jsonContent: {
      action: "PROVISION_SUBSCRIBER_ACCOUNT",
      timestamp: "2026-10-21T04:45:00.000Z",
      subscriberProfile: {
        accountId: "ACC-PREPAID-101",
        tenantId: "TELCO-NATIONAL-01",
        accountClassification: "PREPAID",
        customerTier: "CONSUMER_PREPAID",
        billingCycleDay: 1,
        identities: {
          msisdn: "+919820012345",
          imsi: "404450123456789",
          supi: "imsi-404450123456789",
          gpsi: "msisdn-919820012345",
          pei: "8629100412345670",
          sipUri: "sip:+919820012345@ims.mnc045.mcc404.3gppnetwork.org"
        },
        deviceCapabilities: {
          deviceModel: "Samsung Galaxy S25 5G SA",
          sa5gCapable: true,
          supportedSlices: [
            { sst: 1, sd: "000001", sliceType: "eMBB" },
            { sst: 2, sd: "000002", sliceType: "URLLC" }
          ],
          audioCodecs: ["EVS-SWB 24.4kbps", "AMR-WB 12.65kbps", "AMR-NB 7.4kbps"]
        },
        creditControlPolicy: {
          realTimeRatingRequired: true,
          unitReservationEnabled: true,
          midSessionCutoffOnDepletion: true,
          creditLimitMonetary: 0.00,
          billShockThresholdsPercent: [50, 80, 100]
        }
      }
    }
  },

  tariffBundleConfig: {
    id: 'tariff-bundle-config',
    title: '2. Tariff Bundle Configuration Payload (Multi-Bucket Architecture)',
    standard: '3GPP TS 32.290 Commercial Matrix Specification',
    description: 'Defines a composite commercial bundle with Voice (On-Net, Off-Net, ISD), Data (5G Slice, General, Off-Peak), Rating Groups, draw-down priority cascade, and exhaustion triggers.',
    protocol: 'REST / Administrative Management API',
    direction: 'Product Catalog -> CHF Rating Engine',
    jsonContent: {
      commercialBundle: {
        bundleId: "BUNDLE-5G-VOLTE-CONVERGED-PRO",
        bundleName: "5G True Unlimited SA + VoLTE Sovereign Bundle",
        version: "3.2.0",
        currency: "USD",
        monthlyRecurringCharge: 29.99,
        supportedAccountTypes: ["PREPAID", "POSTPAID"],
        drawdownPriorityCascade: [
          "PROMOTIONAL_GRANT",
          "SLICE_SPECIFIC",
          "DATA_OFFPEAK",
          "DATA_GENERAL",
          "MONETARY_WALLET"
        ],
        voiceAllowanceBuckets: [
          {
            bucketType: "VOICE_ONNET",
            description: "On-Net VoLTE/VoNR Unlimited (Intra-Network)",
            allocatedSeconds: 180000,
            priorityPrecedence: 1
          },
          {
            bucketType: "VOICE_OFFNET",
            description: "Off-Net National Carrier Interconnect",
            allocatedSeconds: 36000,
            priorityPrecedence: 1
          },
          {
            bucketType: "VOICE_ISD",
            description: "International Direct Dialing Allowance",
            allocatedSeconds: 3600,
            priorityPrecedence: 1
          }
        ],
        dataAllowanceBuckets: [
          {
            bucketType: "DATA_SLICE",
            description: "5G Dedicated eMBB High-Speed Slice (SST:1, SD:000001)",
            allocatedBytes: 10737418240,
            priorityPrecedence: 2,
            snssai: { sst: 1, sd: "000001" }
          },
          {
            bucketType: "DATA_OFFPEAK",
            description: "Night Owl Data Quota (00:00 - 06:00 Local Time)",
            allocatedBytes: 21474836480,
            priorityPrecedence: 2,
            timeWindow: { startHour: 0, endHour: 6 }
          },
          {
            bucketType: "DATA_GENERAL",
            description: "General 4G/5G Broadband Data Volume",
            allocatedBytes: 53687091200,
            priorityPrecedence: 3
          }
        ],
        ratingGroups: [
          {
            ratingGroup: 100,
            serviceDescription: "5G eMBB Sliced Broadband Data",
            unitType: "BYTES",
            ratingBasis: "VOLUME_TOTAL",
            baseRate: { monetaryPrice: 0.05, unitScale: 524288000 },
            defaultQuotaGrant: { volumeBytes: 104857600, validityTimeSec: 300, quotaHoldingTimeSec: 60 },
            trafficBinding: { sNssai: { sst: 1, sd: "000001" }, default5QI: 9 }
          },
          {
            ratingGroup: 200,
            serviceDescription: "IMS VoLTE/VoNR On-Net Voice (GBR 5QI 1)",
            unitType: "SECONDS",
            ratingBasis: "DURATION",
            baseRate: { monetaryPrice: 0.01, unitScale: 60 },
            defaultQuotaGrant: { durationSeconds: 180, validityTimeSec: 600, quotaHoldingTimeSec: 120 },
            trafficBinding: { default5QI: 1, serviceContextId: "32260@3gpp.org" }
          }
        ],
        policyCounterThresholds: [
          { counterId: "DATA_MONTHLY_MB", thresholdPercentage: 50, action: "DISPATCH_SMS_ALERT" },
          { counterId: "DATA_MONTHLY_MB", thresholdPercentage: 80, action: "NOTIFY_N28_PCF_NEAR_DEPLETION" },
          { counterId: "DATA_MONTHLY_MB", thresholdPercentage: 100, action: "NOTIFY_N28_PCF_DOWNTHROTTLE_5QI" }
        ]
      }
    }
  },

  bundleAttachment: {
    id: 'bundle-attachment',
    title: '3. Bundle Attachment & Wallet Activation Payload',
    standard: '3GPP TS 32.290 OCS Activation Protocol',
    description: 'Links an active subscriber account to the commercial bundle, initializes sub-buckets, and credits the stored-value monetary wallet.',
    protocol: 'REST JSON / Billing Orchestration API',
    direction: 'Billing Orchestrator -> CHF Balance Core',
    jsonContent: {
      action: "ATTACH_BUNDLE_AND_ACTIVATE_WALLETS",
      timestamp: "2026-10-21T04:46:12.000Z",
      activationRequest: {
        accountId: "ACC-PREPAID-101",
        supi: "imsi-404450123456789",
        bundleId: "BUNDLE-5G-VOLTE-CONVERGED-PRO",
        effectiveStartDate: "2026-10-21T00:00:00Z",
        expirationDate: "2026-11-20T23:59:59Z",
        autoRenewalEnabled: true,
        walletInitialCredit: {
          currency: "USD",
          amount: 50.00,
          fundingSource: "DIGITAL_PAYMENT_GATEWAY",
          transactionRef: "TXN-AUTO-CREDIT-992144"
        },
        initialBucketInstantiations: [
          { bucketId: "BKT-PRM-01", bucketType: "PROMOTIONAL_GRANT", unit: "BYTES", capacity: 5368709120, priority: 1 },
          { bucketId: "BKT-SLC-01", bucketType: "DATA_SLICE", unit: "BYTES", capacity: 10737418240, priority: 2 },
          { bucketId: "BKT-DAT-GEN", bucketType: "DATA_GENERAL", unit: "BYTES", capacity: 53687091200, priority: 3 },
          { bucketId: "BKT-V-ONNET", bucketType: "VOICE_ONNET", unit: "SECONDS", capacity: 180000, priority: 1 },
          { bucketId: "BKT-V-OFFNET", bucketType: "VOICE_OFFNET", unit: "SECONDS", capacity: 36000, priority: 1 },
          { bucketId: "BKT-CORE-WALLET", bucketType: "MONETARY_WALLET", unit: "MONETARY", capacity: 50.00, priority: 5 }
        ]
      }
    }
  },

  smfInitialRating: {
    id: 'smf-initial-rating',
    title: '4. 5G SMF Initial Quota Reservation (Nchf_ConvergedCharging POST)',
    standard: '3GPP TS 32.291 (Release 18 / N40 Reference Point)',
    description: 'Inbound HTTP/2 JSON request from 5G SMF establishing a PDU session, specifying S-NSSAI slice, 5QI 9 QoS, and requesting 100MB SCUR initial unit reservation.',
    protocol: 'HTTP/2 REST JSON',
    direction: '5G SMF -> Unified Gateway -> CHF Rating Core',
    jsonContent: {
      invocationTimeStamp: "2026-10-21T04:47:00.124Z",
      invocationSequenceNumber: 1,
      subscriberIdentifier: "imsi-404450123456789",
      pduSessionChargingInformation: {
        chargingId: 1092847291,
        pduSessionId: 1,
        networkSlicingInfo: {
          sNSSAI: { sst: 1, sd: "000001" }
        },
        pduType: "IPV4V6",
        userInformation: {
          supi: "imsi-404450123456789",
          gpsi: "msisdn-919820012345",
          pei: "8629100412345670",
          userLocationInfo: {
            nrLocation: {
              tai: { plmnId: { mcc: "404", mnc: "045" }, tac: "0000A1" },
              ncgi: { plmnId: { mcc: "404", mnc: "045" }, nrCellId: "00000004F" }
            }
          }
        },
        authorizedQoSInformation: {
          "5qi": 9,
          arp: { priorityLevel: 8, preemptCap: "NOT_PREEMPT", preemptVuln: "NOT_PREEMPTABLE" }
        }
      },
      multipleUnitUsage: [
        {
          ratingGroup: 100,
          serviceId: 1001,
          requestedUnit: {
            totalVolume: 104857600,
            uplinkVolume: 20971520,
            downlinkVolume: 83886080
          }
        }
      ]
    }
  },

  imsTasInitialRating: {
    id: 'ims-tas-initial-rating',
    title: '5. IMS TAS VoLTE Call Setup Request (Diameter Ro CCR-Initial)',
    standard: '3GPP TS 32.299 / RFC 4006 Diameter DCCA',
    description: 'Inbound binary/translated Diameter Ro CCR-I packet from IMS Telephony Application Server (TAS) / CSCF for VoLTE voice call reservation (180 seconds, GBR 5QI 1, Priority 0).',
    protocol: 'Diameter Ro (3GPP TS 32.299)',
    direction: 'IMS TAS/CSCF -> Unified Gateway -> CHF Rating Core',
    jsonContent: {
      diameterHeader: {
        version: 1,
        commandFlags: "REQ, PXY",
        commandCode: 272,
        commandName: "Credit-Control-Request (CCR)",
        applicationId: 4,
        applicationName: "Diameter Credit-Control Application (DCCA)",
        hopByHopId: "0x4A19F802",
        endToEndId: "0xBC81092F"
      },
      attributeValuePairs: {
        "Session-Id": "ims-cscf.mnc045.mcc404.3gppnetwork.org;1729482910;4882",
        "Origin-Host": "tas01.ims.mnc045.mcc404.3gppnetwork.org",
        "Origin-Realm": "ims.mnc045.mcc404.3gppnetwork.org",
        "Destination-Realm": "chf.mnc045.mcc404.3gppnetwork.org",
        "Auth-Application-Id": 4,
        "Service-Context-Id": "32260@3gpp.org",
        "CC-Request-Type": 1,
        "CC-Request-Type-Desc": "INITIAL_REQUEST",
        "CC-Request-Number": 0,
        "Subscription-Id": [
          { "Subscription-Id-Type": 0, "Subscription-Id-Type-Desc": "END_USER_E164 (GPSI/MSISDN)", "Subscription-Id-Data": "+919820012345" },
          { "Subscription-Id-Type": 1, "Subscription-Id-Type-Desc": "END_USER_IMSI (SUPI)", "Subscription-Id-Data": "404450123456789" },
          { "Subscription-Id-Type": 2, "Subscription-Id-Type-Desc": "END_USER_SIP_URI", "Subscription-Id-Data": "sip:+919820012345@ims.mnc045.mcc404.3gppnetwork.org" }
        ],
        "Service-Information": {
          "IMS-Information": {
            "Node-Functionality": 0,
            "Role-Of-Node": "ORIGINATING_ROLE",
            "Calling-Party-Address": "sip:+919820012345@ims.mnc045.mcc404.3gppnetwork.org",
            "Called-Party-Address": "sip:+919820098765@ims.mnc045.mcc404.3gppnetwork.org",
            "SDP-Media-Component": { "SDP-Media-Type": "audio", "Codec": "EVS-SWB/16000" }
          }
        },
        "Multiple-Services-Credit-Control": [
          {
            "Rating-Group": 200,
            "Service-Identifier": 2001,
            "Requested-Service-Unit": { "CC-Time": 180 }
          }
        ]
      }
    }
  }
};
