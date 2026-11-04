DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'gtadmin') THEN
    CREATE USER gtadmin WITH PASSWORD 'GtMiningPass2026!';
  END IF;
END
$$;

SELECT 'CREATE DATABASE gt_mining OWNER gtadmin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gt_mining')\gexec

GRANT ALL PRIVILEGES ON DATABASE gt_mining TO gtadmin;

\c gt_mining;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users table (Ledger Account)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by VARCHAR(32),
    balance NUMERIC(18, 6) DEFAULT 0.000000,
    total_mined NUMERIC(18, 6) DEFAULT 0.000000,
    mining_rate NUMERIC(10, 2) DEFAULT 2.50,
    is_mining BOOLEAN DEFAULT FALSE,
    mining_expires_at TIMESTAMP WITH TIME ZONE,
    kyc_status VARCHAR(20) DEFAULT 'unverified',
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 4-Hour Mining Epoch Sessions with Cryptographic Proof
CREATE TABLE IF NOT EXISTS mining_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hash_rate VARCHAR(32) DEFAULT '2.50 GH/s',
    reward NUMERIC(18, 6) DEFAULT 1.000000,
    status VARCHAR(20) DEFAULT 'active',
    proof_hash VARCHAR(66)
);

-- 3. Multi-Tier Referral Dividends (10% Protocol Rule)
CREATE TABLE IF NOT EXISTS referral_commissions (
    id VARCHAR(64) PRIMARY KEY,
    referrer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    referee_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    commission_amount NUMERIC(18, 6) NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    proof_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Decentralized Web3 Merkle Proofs & Audit Ledger
CREATE TABLE IF NOT EXISTS audit_blocks (
    block_height SERIAL PRIMARY KEY,
    merkle_root VARCHAR(66) NOT NULL,
    previous_hash VARCHAR(66) NOT NULL,
    ipfs_cid VARCHAR(120),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grant schema privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO gtadmin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO gtadmin;
