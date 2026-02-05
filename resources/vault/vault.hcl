ui = true

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/vault/tls/vault.crt"
  tls_key_file  = "/vault/tls/vault.key"
}

storage "raft" {
  path    = "/vault/data"
  node_id = "vault-1"
}

api_addr     = "https://vault:8200"
cluster_addr = "https://vault:8201"

disable_mlock = true