#!/bin/bash

# levantar backend
cd server && npm run dev &

# levantar frontend
cd client && npm run dev
