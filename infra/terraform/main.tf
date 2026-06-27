# SOL Hub Infrastructure (Terraform)
# This is a template - customize for your cloud provider
#
# Resources to create:
# - VPC + subnets
# - PostgreSQL RDS instance
# - Redis ElastiCache cluster
# - S3 bucket for file uploads
# - ECS Fargate cluster for API + Worker
# - CloudFront CDN for static assets
# - Route53 DNS
# - ACM SSL certificate

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
