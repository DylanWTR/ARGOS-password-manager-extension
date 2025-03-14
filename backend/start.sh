#!/bin/bash

export $(grep -v '^#' .env | xargs)

uvicorn main:app --reload --host 0.0.0.0 --port 8000
