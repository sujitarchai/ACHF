/**
 * Architectural Diagrams (Mermaid.js specifications)
 * 1. Unified Ingress, Identity Resolution & Multi-Bucket Drawdown Flow
 * 2. Dual-Session Converged Call Sequence Flow (5G SMF + VoLTE IMS TAS + PGW)
 */

export const MERMAID_DIAGRAM_LOGICAL_ARCH = `flowchart TD
    subgraph Ingress_Clients ["1. Core Network Ingress Elements (Dual-Stack)"]
        SMF["5G Core SMF<br/><b>Nchf_ConvergedCharging (HTTP/2)</b><br/>Session: PDU Session ID / 5QI 9"]
        PGW["4G EPC PGW<br/><b>Diameter Gy (RFC 4006 / SCTP)</b><br/>Session: Bearer ID / QCI 9"]
        TAS["IMS TAS / CSCF<br/><b>Diameter Ro (3GPP TS 32.299)</b><br/>Session: SIP INVITE / GBR 5QI 1"]
    end

    subgraph Edge_Gateway ["2. Unified Carrier Edge Gateway & Priority Arbiter"]
        direction TB
        Term["mTLS 1.3 / HTTP/2 Termination & SCTP Diameter Stack"]
        Normalizer["Protocol Normalizer & Event Dissector<br/>(Extracts MSISDN, IMSI, SUPI, RG, RSU)"]
        
        subgraph Priority_Queues ["WFQ & Strict Priority Scheduler"]
            PQ0["Priority Queue P0 (Strict, W:80)<br/>IMS TAS VoLTE/VoNR Voice"]
            PQ1["Guaranteed Queue P1 (W:15)<br/>5G Dedicated Network Slices"]
            PQ2["Best-Effort Queue P2 (W:5)<br/>5G SMF & 4G PGW Data Sessions"]
        end
    end

    subgraph Core_Rating_Engine ["3. Real-Time Identity Resolution & Rating Core"]
        direction TB
        IdResolver["3GPP Identity Resolver<br/>Correlates SUPI ⇄ IMSI ⇄ MSISDN ⇄ GPSI ⇄ PEI"]
        AccountClassifier{"Account Classification Check"}
        
        PrepaidPath["Prepaid Real-Time Credit Check<br/>Strict Unit Reservation (SCUR)<br/>Zero Balance = Mid-Session Cutoff"]
        PostpaidPath["Postpaid Credit Limit Manager<br/>Zero-Balance Pass-Through<br/>Credit Limit & Bill Shock Thresholds"]

        subgraph Bucket_Cascade ["Multi-Bucket Drawdown Evaluation Engine"]
            B1["1. Promotional / Free Grants"]
            B2["2. Time-Bound / S-NSSAI Slice Buckets"]
            B3["3. Off-Peak / Night Owl Quota (00-06h)"]
            B4["4. Primary General Voice/Data Pool"]
            B5["5. Main Monetary Currency Wallet"]
        end
    end

    subgraph Memory_Fabric ["4. Distributed In-Memory Fabric (Sub-10ms P99)"]
        RedisCAS["Redis Cluster / DragonflyDB<br/>Atomic Lua CAS Primitives (Sub-1ms)"]
        SessionStore["Active Session State Store<br/>(TTL, Quota Grants, Validity Timers)"]
    end

    subgraph Settlement_Policy ["5. Policy & Settlement Interworking"]
        PCF["5G Core PCF (N28)<br/>Threshold Alerts (50%/80%/100%)<br/>Down-throttle to 5QI 80"]
        Kafka["Kafka / Redpanda Event Bus<br/>Async Fire-and-Forget CDR Settlement"]
    end

    %% Flow connections
    SMF -->|"HTTP/2 POST ChargingDataRequest"| Term
    PGW -->|"Diameter Gy CCR [Initial/Update]"| Term
    TAS -->|"Diameter Ro CCR [Initial Voice]"| Term

    Term --> Normalizer
    Normalizer --> PQ0 & PQ1 & PQ2

    PQ0 -->|"Preempt & Dispatch (<2ms)"| IdResolver
    PQ1 -->|"Priority Dispatch"| IdResolver
    PQ2 -->|"Fair Queued Dispatch"| IdResolver

    IdResolver --> AccountClassifier
    AccountClassifier -->|"Prepaid Account"| PrepaidPath
    AccountClassifier -->|"Postpaid Account"| PostpaidPath

    PrepaidPath --> B1
    PostpaidPath --> B1

    B1 --> B2 --> B3 --> B4 --> B5

    B5 <-->|"Atomic Balance Deduct / Lock"| RedisCAS
    RedisCAS <--> SessionStore

    %% Output Grants
    RedisCAS -->|"Granted Units (GSU) Response"| Term
    Term -->|"HTTP/2 200 OK (Quota Granted)"| SMF
    Term -->|"Diameter CCA-Initial (Granted Units)"| PGW
    Term -->|"Diameter CCA-Initial (Voice Granted 180s)"| TAS

    %% Asynchronous Side-Effects
    RedisCAS -.->|"Threshold Breached (80%/100%)"| PCF
    RedisCAS -.->|"Async CDR Record"| Kafka

    classDef ingress fill:#ffffff,stroke:#ea580c,stroke-width:2px,color:#0f172a;
    classDef gateway fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#7c2d12;
    classDef engine fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#881337;
    classDef memory fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef policy fill:#faf5ff,stroke:#9333ea,stroke-width:2px,color:#581c87;

    class SMF,PGW,TAS ingress;
    class Term,Normalizer,PQ0,PQ1,PQ2 gateway;
    class IdResolver,AccountClassifier,PrepaidPath,PostpaidPath,B1,B2,B3,B4,B5 engine;
    class RedisCAS,SessionStore memory;
    class PCF,Kafka policy;
`;

export const MERMAID_DIAGRAM_SEQUENCE_FLOW = `sequenceDiagram
    autonumber
    actor Alice as Mobile Device (Alice: MSISDN +919820012345)
    participant SMF as 5G SMF (Nchf/N40)
    participant TAS as IMS TAS (Diameter Ro)
    participant PGW as 4G PGW (Diameter Gy)
    participant GW as Unified Edge Gateway
    participant CHF as CHF In-Memory Rating Core (Redis CAS)
    participant PCF as 5G Core PCF (N28)
    participant Kafka as Kafka CDR Settlement

    Note over Alice,Kafka: SCENARIO 1: Unified Identity Resolution & 5G PDU Session Establishment
    Alice->>SMF: Attach & Request 5G PDU Session (S-NSSAI 1-000001, 5QI 9)
    SMF->>GW: HTTP/2 POST /nchf-convergedcharging/v3/chargingdata<br/>SUPI: imsi-404450123456789, RG: 100, RSU: 100MB
    GW->>CHF: Correlate SUPI ⇄ MSISDN (+919820012345) & Check Account (Prepaid)
    CHF->>CHF: Execute Multi-Bucket Cascade: Promo (100MB drawn)
    CHF-->>GW: HTTP/2 200 OK (Granted-Unit: 100MB, Validity: 300s)
    GW-->>SMF: PDU Session Established (5QI 9 Gigabit Data Active)

    Note over Alice,Kafka: SCENARIO 2: Concurrent Incoming VoLTE Voice Call (Strict Priority Preemption)
    Alice->>TAS: Incoming HD VoLTE Call Setup (SIP INVITE)
    TAS->>GW: Diameter Ro CCR [Initial] (CC-Request-Type=1)<br/>Subscription-Id: +919820012345, RG: 200, RSU: 180s
    GW->>CHF: [Priority Queue 0 Preemption] Resolve MSISDN & Reserve Voice Quota
    CHF->>CHF: Drawdown from Voice On-Net Bucket (180s reserved in 1.2ms)
    CHF-->>GW: Diameter CCA [Initial] (Result-Code: 2001 SUCCESS, GSU: 180s)
    GW-->>TAS: Forward Diameter CCA
    TAS-->>Alice: SIP 200 OK (Voice Call Established in GBR 5QI 1)

    Note over Alice,Kafka: SCENARIO 3: Quota Depletion & N28 Threshold Breach Notification
    Alice->>SMF: Continuous 4K Streaming Exhausts General Data Bucket
    SMF->>GW: HTTP/2 POST /chargingdata [Interim Update]<br/>Used: 100MB, Requested: 100MB
    CHF->>CHF: Cascade Check: Promo Empty, Slice Empty, General Empty!<br/>Balance = 0MB (100% Depleted)
    CHF->>PCF: HTTP/2 POST /npcf-spending-limit-control/v1/notify (N28)<br/>Status: BREACHED_100, SUPI: imsi-404450123456789
    PCF-->>CHF: 204 No Content
    PCF->>SMF: Npcf_SMPolicyControl: Modify 5QI 9 -> 5QI 80 (Throttle 128kbps)<br/>Inject Captive Portal Redirection
    CHF-->>GW: HTTP/2 200 OK (Granted: 0MB, Result: QUOTA_EXHAUSTED)
    GW-->>SMF: SMF enforces down-throttle & captive portal

    Note over Alice,Kafka: SCENARIO 4: Session Teardown & Asynchronous CDR Settlement
    Alice->>TAS: Call Hangup (SIP BYE)
    TAS->>GW: Diameter Ro CCR [Termination] (Used: 145s)
    GW->>CHF: Settle Voice Call: Debit 145s, Refund unconsumed 35s
    CHF->>Kafka: Async Emit Ro Voice CDR to Billing Ledger
    CHF-->>GW: Diameter CCA [Termination] (2001 SUCCESS)
    GW-->>TAS: Terminated
`;
