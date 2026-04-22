# Agromart - Livestock & Agricultural Marketplace

Production-ready full-stack marketplace built with React, Node.js, Express, and MongoDB.

## Structure

- `client` - React + Redux Toolkit + Material UI frontend
- `server` - Express + MongoDB + JWT + Google OAuth backend

## Quick Start

1. Configure backend env:
   - `cd server`
   - copy `.env.example` to `.env`
2. Configure frontend env:
   - `cd ../client`
   - copy `.env.example` to `.env`
3. Start backend:
   - `cd ../server && npm install && npm run dev`
4. Start frontend:
   - `cd ../client && npm install && npm run dev`

## Implemented capabilities

- Email/password auth + Google OAuth callback
- JWT-protected API routes
- Product catalog with categories, search, filters, pagination
- Featured and hot-deal products
- Wishlist, reviews and ratings
- Cart + checkout with location input
- Order creation, delivery ETA countdown, status lifecycle
- Socket-based real-time order notifications + sound alert
- User dashboard with last purchases
- Admin dashboard with analytics, product creation, order management
- Cloudinary upload endpoint for product images
- Email notifications hook for order updates

## Notes

- Add real payment provider integration before production launch.
- Configure SMTP and Cloudinary env vars for full feature enablement.
