variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "database_url" {
  description = "Postgres connection string"
  type        = string
}

variable "redis_url" {
  description = "Redis connection string"
  type        = string
}

variable "object_storage" {
  description = "Object storage endpoint (e.g. minio)"
  type        = string
}

variable "cors_origins" {
  description = "CORS origins comma-separated"
  type        = string
  default     = "http://localhost:3000,http://127.0.0.1:3000"
}