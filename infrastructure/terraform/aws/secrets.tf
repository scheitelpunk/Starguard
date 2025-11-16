# ==========================================
# SENTINEL ENTERPRISE - Secrets Management
# ==========================================

# KMS Keys
resource "aws_kms_key" "secrets" {
  description             = "KMS key for Secrets Manager"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-secrets-kms"
  }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.project_name}-secrets"
  target_key_id = aws_kms_key.secrets.key_id
}

resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-rds-kms"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# Random Passwords
resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "random_password" "redis_password" {
  length  = 32
  special = false # Redis doesn't allow special chars in auth token
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}/db-password"
  description             = "RDS PostgreSQL password"
  kms_key_id             = aws_kms_key.secrets.id
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
  })
}

resource "aws_secretsmanager_secret" "redis_password" {
  name                    = "${var.project_name}/redis-password"
  description             = "ElastiCache Redis password"
  kms_key_id             = aws_kms_key.secrets.id
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-redis-password"
  }
}

resource "aws_secretsmanager_secret_version" "redis_password" {
  secret_id = aws_secretsmanager_secret.redis_password.id
  secret_string = jsonencode({
    password = random_password.redis_password.result
  })
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/jwt-secret"
  description             = "JWT secret for authentication"
  kms_key_id             = aws_kms_key.secrets.id
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    secret         = random_password.jwt_secret.result
    refresh_secret = random_password.jwt_secret.result # In production, use different secret
  })
}
