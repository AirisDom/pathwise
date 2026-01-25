# PathWise - Backend Architecture & Database Planning

## 🏗️ Technology Stack

### Core Technologies
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (recommended) / MySQL
- **Authentication**: NextAuth.js v5 (Auth.js)
- **File Storage**: AWS S3 / Cloudinary / Vercel Blob
- **Payment Processing**: Stripe
- **Email Service**: Resend / SendGrid
- **Video Hosting**: AWS S3 + CloudFront / Vimeo API

---

## 📊 Database Schema (Prisma)

### Core Entities

#### 1. User Management
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // Hashed with bcrypt
  role          UserRole  @default(STUDENT)
  bio           String?   @db.Text
  title         String?   // For creators: "Web Developer Expert"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  courses       Course[]  // As creator
  enrollments   Enrollment[]
  reviews       Review[]
  comments      Comment[]
  messages      Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications Notification[]
  
  // Creator-specific fields
  creatorProfile CreatorProfile?
  
  @@map("users")
}

enum UserRole {
  STUDENT
  CREATOR
  ADMIN
}

model CreatorProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Professional Info
  headline        String?
  website         String?
  twitter         String?
  linkedin        String?
  youtube         String?
  
  // Statistics
  totalStudents   Int      @default(0)
  totalRevenue    Decimal  @default(0) @db.Decimal(10, 2)
  totalCourses    Int      @default(0)
  averageRating   Decimal? @db.Decimal(3, 2)
  
  // Payout Info
  paypalEmail     String?
  bankAccount     String?
  
  // Verification
  isVerified      Boolean  @default(false)
  verifiedAt      DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("creator_profiles")
}
```

#### 2. Course Management
```prisma
model Course {
  id              String      @id @default(cuid())
  title           String
  slug            String      @unique
  subtitle        String?
  description     String      @db.Text
  
  // Content
  thumbnail       String?
  previewVideo    String?
  language        String      @default("en")
  level           CourseLevel @default(BEGINNER)
  category        String
  subcategory     String?
  tags            String[]    // Array of tags
  
  // Pricing
  price           Decimal     @db.Decimal(10, 2)
  discountPrice   Decimal?    @db.Decimal(10, 2)
  currency        String      @default("USD")
  
  // Status
  status          CourseStatus @default(DRAFT)
  publishedAt     DateTime?
  
  // Creator
  creatorId       String
  creator         User        @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  // Statistics
  enrollmentCount Int         @default(0)
  averageRating   Decimal?    @db.Decimal(3, 2)
  reviewCount     Int         @default(0)
  viewCount       Int         @default(0)
  completionRate  Decimal?    @db.Decimal(5, 2)
  
  // Learning Outcomes
  learningOutcomes String[]
  requirements     String[]
  targetAudience   String[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  sections        Section[]
  enrollments     Enrollment[]
  reviews         Review[]
  comments        Comment[]
  
  @@index([creatorId])
  @@index([status])
  @@index([category])
  @@map("courses")
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}

enum CourseStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}

model Section {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  title       String
  description String?  @db.Text
  order       Int
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  lessons     Lesson[]
  
  @@index([courseId])
  @@map("sections")
}

model Lesson {
  id          String      @id @default(cuid())
  sectionId   String
  section     Section     @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  title       String
  description String?     @db.Text
  type        LessonType
  order       Int
  
  // Content based on type
  videoUrl    String?
  videoDuration Int?      // in seconds
  articleContent String?  @db.Text
  resourceUrl String?
  quizId      String?
  
  // Settings
  isFree      Boolean     @default(false)
  isPreview   Boolean     @default(false)
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  progress    LessonProgress[]
  
  @@index([sectionId])
  @@map("lessons")
}

enum LessonType {
  VIDEO
  ARTICLE
  QUIZ
  RESOURCE
  ASSIGNMENT
}
```

#### 3. Enrollment & Progress
```prisma
model Enrollment {
  id              String   @id @default(cuid())
  
  studentId       String
  student         User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  courseId        String
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Payment
  price           Decimal  @db.Decimal(10, 2)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentId       String?  // Stripe payment ID
  
  // Progress
  progress        Decimal  @default(0) @db.Decimal(5, 2) // Percentage
  isCompleted     Boolean  @default(false)
  completedAt     DateTime?
  lastAccessedAt  DateTime?
  
  // Certificate
  certificateId   String?
  certificateIssuedAt DateTime?
  
  enrolledAt      DateTime @default(now())
  
  // Relations
  lessonProgress  LessonProgress[]
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@map("enrollments")
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model LessonProgress {
  id            String     @id @default(cuid())
  
  enrollmentId  String
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  
  lessonId      String
  lesson        Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  isCompleted   Boolean    @default(false)
  completedAt   DateTime?
  watchDuration Int?       // in seconds, for video lessons
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  @@unique([enrollmentId, lessonId])
  @@index([enrollmentId])
  @@map("lesson_progress")
}
```

#### 4. Reviews & Ratings
```prisma
model Review {
  id          String   @id @default(cuid())
  
  studentId   String
  student     User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  rating      Int      // 1-5
  comment     String?  @db.Text
  
  // Moderation
  isApproved  Boolean  @default(true)
  isFlagged   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([studentId, courseId])
  @@index([courseId])
  @@map("reviews")
}
```

#### 5. Comments & Discussions
```prisma
model Comment {
  id          String    @id @default(cuid())
  
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  content     String    @db.Text
  
  // Thread support
  parentId    String?
  parent      Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies     Comment[] @relation("CommentReplies")
  
  // Engagement
  likeCount   Int       @default(0)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([courseId])
  @@index([userId])
  @@map("comments")
}
```

#### 6. Messaging System
```prisma
model Message {
  id          String   @id @default(cuid())
  
  senderId    String
  sender      User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  
  receiverId  String
  receiver    User     @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  
  subject     String?
  content     String   @db.Text
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  // Thread support
  threadId    String?
  
  createdAt   DateTime @default(now())
  
  @@index([senderId])
  @@index([receiverId])
  @@index([threadId])
  @@map("messages")
}
```

#### 7. Notifications
```prisma
model Notification {
  id          String           @id @default(cuid())
  
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        NotificationType
  title       String
  message     String           @db.Text
  link        String?
  
  isRead      Boolean          @default(false)
  readAt      DateTime?
  
  createdAt   DateTime         @default(now())
  
  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

enum NotificationType {
  ENROLLMENT
  COURSE_UPDATE
  NEW_MESSAGE
  NEW_COMMENT
  NEW_REVIEW
  ACHIEVEMENT
  PAYMENT
  SYSTEM
}
```

#### 8. Analytics & Statistics
```prisma
model CourseAnalytics {
  id              String   @id @default(cuid())
  courseId        String
  date            DateTime @db.Date
  
  // Daily metrics
  views           Int      @default(0)
  enrollments     Int      @default(0)
  completions     Int      @default(0)
  revenue         Decimal  @default(0) @db.Decimal(10, 2)
  
  // Engagement
  averageWatchTime Int?    // in seconds
  dropOffRate     Decimal? @db.Decimal(5, 2)
  
  createdAt       DateTime @default(now())
  
  @@unique([courseId, date])
  @@index([courseId])
  @@index([date])
  @@map("course_analytics")
}

model UserAnalytics {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date
  
  // Creator metrics
  totalRevenue    Decimal  @default(0) @db.Decimal(10, 2)
  newStudents     Int      @default(0)
  totalViews      Int      @default(0)
  
  createdAt       DateTime @default(now())
  
  @@unique([userId, date])
  @@index([userId])
  @@index([date])
  @@map("user_analytics")
}
```

#### 9. NextAuth Tables
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## 🔐 Authentication & Authorization

### Authentication Strategy
- **NextAuth.js v5** with credentials provider
- **OAuth Providers**: Google, GitHub, LinkedIn
- **Email verification** required for new accounts
- **Password reset** flow with time-limited tokens
- **Session management** with JWT tokens

### Authorization Levels
1. **Student**: Can enroll, access enrolled courses, submit reviews
2. **Creator**: All student permissions + create/manage courses, view analytics
3. **Admin**: Full system access, user management, content moderation

### Middleware Protection
```typescript
// Protected routes:
/CreatorDashboard/*     -> CREATOR or ADMIN
/CreatorCourses/*       -> CREATOR or ADMIN
/CreatorAnalytics/*     -> CREATOR or ADMIN
/admin/*                -> ADMIN only
/api/courses/create     -> CREATOR or ADMIN
/api/courses/:id/edit   -> CREATOR (own courses) or ADMIN
```

---

## 🛣️ API Routes Structure

### Public APIs
```
GET  /api/courses                    -> List all published courses
GET  /api/courses/[slug]             -> Get course details
GET  /api/courses/[id]/sections      -> Get course curriculum
GET  /api/categories                 -> List all categories
GET  /api/creators/[id]              -> Get creator profile
POST /api/auth/register              -> User registration
POST /api/auth/login                 -> User login
POST /api/auth/forgot-password       -> Password reset request
```

### Student APIs (Protected)
```
POST /api/enrollments                -> Enroll in course
GET  /api/enrollments                -> Get user enrollments
GET  /api/courses/[id]/progress      -> Get course progress
POST /api/courses/[id]/progress      -> Update lesson progress
POST /api/reviews                    -> Submit course review
PUT  /api/reviews/[id]               -> Update review
POST /api/comments                   -> Post comment
GET  /api/messages                   -> Get messages
POST /api/messages                   -> Send message
GET  /api/notifications              -> Get notifications
PUT  /api/notifications/[id]/read    -> Mark as read
```

### Creator APIs (Protected)
```
POST /api/courses                    -> Create new course
PUT  /api/courses/[id]               -> Update course
DELETE /api/courses/[id]             -> Delete course
POST /api/courses/[id]/sections      -> Add section
POST /api/sections/[id]/lessons      -> Add lesson
GET  /api/analytics/overview         -> Dashboard stats
GET  /api/analytics/revenue          -> Revenue analytics
GET  /api/analytics/students         -> Student analytics
GET  /api/analytics/courses          -> Course performance
POST /api/upload/video               -> Upload video
POST /api/upload/thumbnail           -> Upload image
GET  /api/students                   -> List enrolled students
GET  /api/reviews/pending            -> Get pending reviews
```

### Admin APIs (Protected)
```
GET  /api/admin/users                -> List all users
PUT  /api/admin/users/[id]/role      -> Update user role
GET  /api/admin/courses/pending      -> Courses pending review
PUT  /api/admin/courses/[id]/approve -> Approve course
GET  /api/admin/analytics            -> Platform analytics
```

---

## 📁 File Upload Strategy

### Video Content
- **Storage**: AWS S3 or Cloudinary
- **Processing**: AWS MediaConvert for HLS/DASH streaming
- **CDN**: CloudFront for fast delivery
- **Formats**: Support MP4, MOV, AVI (convert to web-optimized formats)
- **Max Size**: 5GB per video
- **Security**: Signed URLs with expiration

### Images (Thumbnails, Avatars)
- **Storage**: Cloudinary or Vercel Blob
- **Processing**: Auto-optimize, resize, format conversion
- **Max Size**: 10MB
- **Formats**: JPG, PNG, WebP

### Documents (Course Resources)
- **Storage**: AWS S3
- **Types**: PDF, DOCX, XLSX, ZIP
- **Max Size**: 100MB

---

## 💳 Payment Integration (Stripe)

### Payment Flow
1. Student clicks "Enroll" on course
2. Frontend creates Stripe Checkout Session
3. Redirect to Stripe-hosted checkout page
4. On success, Stripe webhook triggers enrollment
5. Update database and send confirmation email

### Webhook Events
```typescript
// Listen for these Stripe events:
- checkout.session.completed  -> Create enrollment
- payment_intent.succeeded    -> Confirm payment
- charge.refunded            -> Handle refund
```

### Revenue Splits
- **Platform Fee**: 10% of course price
- **Creator Payout**: 90% of course price
- **Payout Schedule**: Monthly (minimum $50 balance)

---

## 📧 Email Notifications

### Transactional Emails (Resend/SendGrid)
1. **Welcome Email** - New user registration
2. **Email Verification** - Confirm email address
3. **Enrollment Confirmation** - Course purchase
4. **Course Update** - New content added
5. **Certificate** - Course completion
6. **Payment Receipt** - Transaction confirmation
7. **Password Reset** - Password change request
8. **New Message** - Message notification
9. **Review Response** - Creator responds to review
10. **Payout Notification** - Monthly earnings

---

## 🔍 Search & Filtering

### Search Implementation
- **Primary**: Prisma full-text search
- **Advanced**: ElasticSearch (optional for better performance)
- **Indexing**: Course title, description, tags, creator name

### Filters
- Category/Subcategory
- Price range (Free, $0-$50, $50-$100, $100+)
- Level (Beginner, Intermediate, Advanced)
- Rating (4+ stars, 3+ stars)
- Duration
- Language
- Features (Certificates, Downloadable resources)

---

## 📊 Analytics & Reporting

### Real-time Metrics
- Total students (current)
- Monthly revenue (current month)
- Active courses
- Total views

### Historical Data
- Revenue trends (daily, weekly, monthly)
- Student growth over time
- Course performance comparison
- Completion rates
- Peak engagement times

### Calculated Fields
```typescript
// Update frequency: Hourly via cron job
- Average rating per course
- Enrollment count per course
- Total revenue per creator
- Completion rate per course
- View count per course
```

---

## 🔄 Background Jobs (Cron)

### Scheduled Tasks
```typescript
// Use Vercel Cron or node-cron

// Every hour
- Update course statistics
- Update creator analytics
- Process video transcoding queue

// Daily (midnight)
- Generate daily analytics records
- Send engagement summary emails
- Clean up expired sessions
- Update trending courses

// Weekly
- Send creator earnings summary
- Generate platform reports

// Monthly
- Process creator payouts
- Archive old data
```

---

## 🛡️ Security Measures

### Data Protection
- **Passwords**: bcrypt hashing (10 rounds)
- **API Keys**: Environment variables only
- **SQL Injection**: Prisma parameterized queries
- **XSS**: Input sanitization with DOMPurify
- **CSRF**: NextAuth built-in protection
- **Rate Limiting**: Express-rate-limit on sensitive endpoints

### Access Control
- Row-level security on database queries
- Ownership validation (creators can only edit own courses)
- Role-based middleware
- Signed URLs for video content

---

## 🚀 Performance Optimization

### Database
- **Indexes**: On foreign keys, frequently queried fields
- **Connection Pooling**: Prisma connection pooling
- **Query Optimization**: Use `select` to limit fields
- **Pagination**: Cursor-based pagination for lists

### Caching Strategy
- **Next.js Cache**: Static pages with revalidation
- **API Routes**: Cache GET requests (60s for public data)
- **Redis** (optional): Session storage, hot data
- **CDN**: Static assets, images, videos

### API Response Times Target
- Course listing: < 200ms
- Course details: < 300ms
- Dashboard stats: < 500ms
- Video streaming: < 100ms (first byte)

---

## 📦 Deployment Architecture

### Production Setup
```
├── Next.js App (Vercel)
├── PostgreSQL Database (Supabase/Neon)
├── File Storage (AWS S3 / Cloudinary)
├── Redis Cache (Upstash) [Optional]
├── Email Service (Resend)
├── Payment (Stripe)
└── Monitoring (Sentry)
```

### Environment Variables
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
RESEND_API_KEY=
```

---

## 📝 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Setup Prisma schema
- ✅ Configure NextAuth
- ✅ Implement user registration/login
- ✅ Basic API routes

### Phase 2: Core Features (Week 3-4)
- ✅ Course creation flow
- ✅ Video upload & processing
- ✅ Enrollment system
- ✅ Progress tracking

### Phase 3: Creator Tools (Week 5-6)
- ✅ Creator dashboard with analytics
- ✅ Revenue tracking
- ✅ Student management
- ✅ Content editing tools

### Phase 4: Student Experience (Week 7-8)
- ✅ Course player
- ✅ Progress tracking
- ✅ Reviews & ratings
- ✅ Certificates

### Phase 5: Advanced Features (Week 9-10)
- ✅ Messaging system
- ✅ Notifications
- ✅ Advanced analytics
- ✅ Payment processing

### Phase 6: Polish & Deploy (Week 11-12)
- ✅ Testing & bug fixes
- ✅ Performance optimization
- ✅ Documentation
- ✅ Production deployment

---

## 🎯 Next Steps

1. **Review & Approve** this architecture plan
2. **Setup Database** - Initialize Prisma with PostgreSQL
3. **Implement Auth** - NextAuth configuration
4. **Create Base APIs** - Start with user and course endpoints
5. **Iterate** - Build features incrementally

---

**Document Status**: Planning Phase  
**Last Updated**: January 25, 2026  
**Version**: 1.0.0
