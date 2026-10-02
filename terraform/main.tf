terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# AWS VPC and subnets (simplified for demo)
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "farmlink-vpc"
  }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id              = aws_vpc.main.id
  cidr_block          = "10.0.${count.index + 1}.0/24"
  availability_zone   = data.aws_availability_zones.available.names[count.index]
  tags = {
    Name = "farmlink-private-${count.index}"
  }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id              = aws_vpc.main.id
  cidr_block          = "10.0.${count.index + 5}.0/24"
  availability_zone   = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "farmlink-public-${count.index}"
  }
}

data "aws_availability_zones" "available" {}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "farmlink-cluster"
  tags = {
    Name = "farmlink-cluster"
  }
}

# ECS Task Definition (using the built API Docker image)
resource "aws_ecs_task_definition" "api" {
  family                   = "farmlink-api"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = "FARGATE"
  storage_class            = "EFS"

  container_definitions = jsonencode({
    name  = "farmlink-api",
    image = "${aws_ecr_repository.api.repository_url}:${aws_ecr_repository.api.image_tag}",
    essentials = true,
    memory = 512,
    portMappings = [
      {
        containerPort = 4000,
        hostPort      = 4000,
        protocol      = "tcp"
      }
    ],
    environment = {
      DATABASE_URL = var.database_url
      REDIS_URL    = var.redis_url
      OBJECT_STORAGE = var.object_storage
      API_PORT     = "4000"
      CORS_ORIGINS = var.cors_origins
    }
  })
}

# ECR Repository
resource "aws_ecr_repository" "api" {
  name = "farmlink-api"
  image_scanning_configuration {
    scan_on_push = true
  }
  lifecycle_policy {
    remove_image = {
      count = 5
    }
  }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "farmlink-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets                  = aws_subnet.private.*.id
    assign_public_ip         = false
    security_groups          = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "farmlink-api"
    container_port   = 4000
  }

  tags = {
    Name = "farmlink-api-service"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "api" {
  name     = "farmlink-api-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  health_check {
    path = "/health"
    interval = 30
    timeout = 5
    healthy_http_codes = "200-299"
  }
}

# ALB
resource "aws_lb" "main" {
  name               = "farmlink-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = aws_subnet.public.*.id

  security_groups = [aws_security_group.alb_sg.id]

  tags = {
    Name = "farmlink-alb"
  }
}

# ALB Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "farmlink-alb-sg"
  description = "Allow inbound HTTP from internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "farmlink-ecs-sg"
  description = "Allow inbound from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}