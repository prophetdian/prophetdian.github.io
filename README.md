# Prophet Dian Platform

A comprehensive digital platform for Prophet Dian Grobbelaar featuring user authentication, prophetic feed, e-commerce, badge system, and subscription management.

## 🌟 Features

### Core Features
- **User Authentication**: Email/password registration with Manus OAuth integration
- **Prophetic Feed**: Create, share, and interact with prophetic posts
- **User Profiles**: Customizable user profiles with profile pictures and bios
- **Real-time Notifications**: Like and comment notifications with history
- **Media Upload**: Support for photos and videos in posts

### E-Commerce
- **Badge System**: 5 badge types (Pastor, Teacher, Evangelist, Apostle, Prophet)
- **Navi Society Subscription**: $500/month private prophetic content access
- **Multiple Payment Methods**: PayPal and bank transfer options
- **Order Tracking**: Complete order history and status tracking
- **Payment Confirmations**: Automated email confirmations for all transactions

### Admin Features
- **Admin Dashboard**: Post and comment moderation
- **User Management**: View and manage user accounts
- **Analytics**: Track platform usage and engagement
- **Subscription Management**: Monitor active subscriptions

## 🎨 Design

- **Theme Colors**: Black, #00F7FF (Cyan), #FA00FF (Magenta)
- **Typography**: Fredoka font family
- **Responsive Design**: Mobile-first approach with Tailwind CSS 4
- **Modern UI**: shadcn/ui components with custom styling

## 🛠️ Tech Stack

### Frontend
- React 19
- Tailwind CSS 4
- Vite
- shadcn/ui Components
- Wouter (Routing)
- Sonner (Notifications)

### Backend
- Express 4
- tRPC 11
- Node.js 22.13.0

### Database
- PostgreSQL
- Drizzle ORM

### Authentication
- Manus OAuth
- Session-based authentication

### Payments
- PayPal SDK
- Bank Transfer Integration

### Storage
- S3 (for images and media)
- Supabase Storage (optional)

### Backend
- Express 4
- tRPC 11
- Node.js 22.13.0
- Supabase (Auth, Realtime, Storage)

## 🚀 Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📋 Project Structure

```
prophet-dian/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers (including supabase.ts)
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   ├── supabase.ts        # Supabase server client
│   ├── paypal.ts          # PayPal integration
│   └── _core/             # Core framework
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/prophet_dian
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_manus_app_id
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
# Supabase Configuration
VITE_SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# ... other variables
```

## 📚 Key Routes

### Public Routes
- `/` - Home page
- `/register` - User registration
- `/login` - User login

### Protected Routes
- `/feed` - Prophetic feed
- `/profile` - User profile
- `/profile-edit` - Edit profile
- `/badge-shop` - Browse badges
- `/badge-checkout` - Purchase badge
- `/navi-society-checkout` - Subscribe to Navi Society
- `/payment-success` - Payment confirmation
- `/payment-status` - Subscription management

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/moderation` - Content moderation
- `/admin/users` - User management

## 🔄 Development Workflow

### Adding Features

1. **Update Database Schema**
   ```bash
   # Edit drizzle/schema.ts
   pnpm drizzle-kit generate
   pnpm drizzle-kit push
   ```

2. **Add API Procedures**
   - Edit `server/routers.ts`
   - Add tRPC procedures with proper input validation

3. **Build Frontend**
   - Create components in `client/src/components/`
   - Create pages in `client/src/pages/`
   - Use `trpc.*.useQuery()` and `trpc.*.useMutation()` hooks

4. **Test**
   ```bash
   pnpm test
   ```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/auth.logout.test.ts
```

## 🔄 Payment Flow

### Badge Purchase
1. User selects badge type
2. Chooses payment method (PayPal or bank transfer)
3. Creates order in database
4. PayPal redirects to payment or bank details shown
5. Payment processed and order marked completed
6. Subscription activated automatically
7. Confirmation email sent
8. User redirected to profile

### Navi Society Subscription
1. User clicks subscribe button
2. Chooses payment method
3. Creates order for $500/month
4. Completes payment
5. Subscription activated
6. Access to private Navi Society content granted
7. Confirmation email sent

## 📧 Email Notifications

The platform sends automated emails for:
- User registration confirmation
- Payment confirmations
- Subscription activation
- Subscription renewal reminders
- Payment failure notifications

## 🔔 Notifications

Real-time notifications for:
- New likes on posts
- New comments on posts
- Subscription status changes
- Payment confirmations

## 🛡️ Security

- HTTPS only in production
- JWT-based session management
- CORS protection
- Input validation with Zod
- SQL injection prevention via Drizzle ORM
- Secure password hashing
- Environment variable protection

## 📊 Database Schema

### Key Tables
- `users` - User accounts and profiles
- `posts` - Prophetic feed posts
- `comments` - Post comments
- `likes` - Post likes
- `orders` - Payment orders
- `subscriptions` - Active subscriptions
- `badges` - User badges
- `notifications` - User notifications

## 🚀 Deployment

### Supported Platforms
- Self-hosted VPS
- Railway.app
- Render.com
- Any Node.js hosting provider

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📱 Mobile Support

The platform is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- iOS Safari
- Android Chrome

## 🔄 Continuous Development with Manus

This project is developed using the Manus platform. To continue development:

1. Use Manus for building and testing
2. Push changes to this GitHub repository
3. Deploy to your hosting provider
4. Continue using Manus for future updates

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Verify DATABASE_URL is correct
psql $DATABASE_URL
```

**PayPal Integration Not Working**
- Verify PayPal credentials in `.env`
- Check PayPal mode (sandbox vs live)
- Review PayPal webhook configuration

**Authentication Issues**
- Clear browser cookies
- Verify JWT_SECRET is set
- Check Manus OAuth configuration

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## 📞 Support

For issues or questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review application logs
3. Check browser console for errors
4. Verify environment variables

## 📄 License

This project is proprietary and confidential.

## 👤 Author

Prophet Dian Grobbelaar

---

**Last Updated**: March 28, 2026

**Version**: 13.0

**Status**: Production Ready ✅
