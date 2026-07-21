#!/bin/bash

# levantar backend
cd server && pnpm dev &

# levantar frontend
cd client && pnpm  dev
