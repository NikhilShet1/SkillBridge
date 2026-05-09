# SkillBridge — Local Trade Services Marketplace

SkillBridge is a micro-credential marketplace designed to connect skilled tradespeople (carpenters, electricians, plumbers, etc.) with local households and businesses. Built with a focus on the **Dakshina Kannada** region, it digitizes the local labor market through a seamless, secure, and real-time platform.

## 🚀 Key Features

- **Location-Based Discovery**: Interactive service map using Leaflet.js to find verified workers within a 10km radius.
- **Real-Time Messaging**: Direct, instant communication between customers and workers powered by Supabase Realtime.
- **Booking & Workflow**: Integrated gig management from request to completion.
- **Worker Rating System**: 5-star rating and review system to build trust and ensure service quality.
- **UPI Payment Integration**: Seamless cashless transactions via Razorpay (UPI focus).
- **Responsive Design**: Optimized for both Mobile and Laptop/Desktop specifications with a premium, high-contrast UI.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React.js (Vite) |
| **Styling** | Tailwind CSS v4 |
| **Database & Auth** | Supabase (PostgreSQL) |
| **Real-time** | Supabase Realtime Channels |
| **Payments** | Razorpay API |
| **Maps** | Leaflet.js (OpenStreetMap) |
| **Icons** | Lucide React |

## 📁 Project Structure

```text
src/
├── components/
│   ├── booking/       # BookingFlow, MessagePanel, ReviewForm
│   ├── layout/        # Navbar, BottomNav, Footer, ProtectedRoute
│   ├── map/           # ServiceMap (Leaflet)
│   └── workers/       # WorkerCard, WorkerFilters
├── hooks/             # Custom React hooks
├── lib/               # Supabase client configuration
├── pages/             # App pages (Home, Search, Dashboard, Bookings, Profile)
├── store/             # Zustand state management (authStore)
├── utils/             # Helper functions & constants
└── App.jsx            # Main routing & application layout
```

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Skillbridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - The project uses Supabase. Ensure you have a Supabase project created.
   - Apply the migrations found in `supabase/migrations/` to your project using the Supabase SQL Editor.

4. **Environment Configuration**:
   - The current project has Supabase keys configured in `src/lib/supabase.js`.
   - Update `src/lib/supabase.js` with your specific Supabase URL and Anon Key if needed.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **View the app**:
   Open [http://localhost:5173](http://localhost:5173) (or the port specified in your terminal) in your browser.

## 📜 Database Schema

The platform operates on four core PostgreSQL tables:
- **`users`**: Unified profile for both customers and workers.
- **`services`**: Detailed service offerings for workers (rates, bio, experience).
- **`gigs`**: Tracks booking status, payments, and scheduling.
- **`messages`**: Real-time chat logs between users for specific gigs.
- **`reviews`**: Aggregated customer feedback and ratings.

## ⚖️ License

Distributed under the MIT License.
