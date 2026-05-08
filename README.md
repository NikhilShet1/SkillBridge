# SkillBridge
# SkillBridge — Micro-Credential Marketplace for Trades

## Overview

SkillBridge is a web platform that connects skilled local workers such as carpenters, electricians, plumbers, and technicians with nearby households looking for trusted services.

The platform helps organize the local labour market by providing:

* Verified worker profiles
* Nearby gig booking
* Secure UPI payments
* Ratings and reviews
* Location-based service discovery

SkillBridge is designed to improve accessibility and employment opportunities in regions like Dakshina Kannada and can be scaled to other districts.

---

# Problem Statement

Skilled workers in many areas still rely on offline methods and middlemen to find work, while customers struggle to locate reliable workers quickly.

SkillBridge solves this by creating a digital marketplace for local trade services.

---

# Features

## Worker Features

* Create professional profiles
* Add skills and service categories
* Accept or reject gig requests
* Receive UPI payments
* Build ratings and reviews

## Customer Features

* Search nearby workers
* Book services easily
* Make secure online payments
* Rate completed services

## Admin Features

* Verify worker accounts
* Manage users and reviews
* Monitor platform activity

---

# Tech Stack

| Technology           | Purpose                      |
| ---------------------| -----------------------------|
| JavaScript/React     | Frontend Framework           |
| Firebase             | Authentication & Database    |
| Razorpay API         | Payment Integration          |
| Leaflet Maps         | Location Services            |
| Tailwind CSS         | UI Design                    |

---

# Workflow

1. Worker registers and creates a profile
2. Customer searches for nearby workers
3. Customer sends a gig request
4. Worker accepts the request
5. Payment is completed through Razorpay
6. Customer leaves a rating and review

---

# Future Enhancements

* Multi-language support
* In-app chat system
* AI-based worker recommendations
* Mobile application support
* Emergency booking feature

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/your-username/skillbridge.git
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET=your_secret
```

---

# Conclusion

SkillBridge provides a simple and scalable solution for connecting local skilled workers with households through a trusted digital platform. The system improves accessibility, transparency, and employment opportunities in the local service industry.
