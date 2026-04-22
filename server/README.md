# Agromart Server

## Run

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Modules

- Auth: email/password JWT + Google OAuth
- Products: search, filter, pagination, reviews, wishlist
- Orders: checkout, tracking state, status updates
- Admin: users, orders, analytics
- Upload: Cloudinary image upload
- Notifications: contact admin + socket events
