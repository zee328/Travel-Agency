# Project Structure Guide - Travel Agency Website

## 📋 Complete Folder Structure

```
travel-agency-website/
│
├── 📄 index.html                    # Main entry point (homepage)
├── 📄 STRUCTURE.md                  # This file - explains the architecture
├── 📄 README.md                     # Project overview & setup
│
├── 📁 css/                          # Stylesheets
│   ├── styles.css                   # Main CSS (all styles combined)
│   └── (future: component styles)   # Will grow as project scales
│
├── 📁 js/                           # JavaScript files
│   ├── main.js                      # Main JavaScript logic
│   ├── utils.js                     # Helper functions (future)
│   └── api.js                       # API calls (future - for backend)
│
├── 📁 data/                         # Frontend data (NO BACKEND YET)
│   ├── destinations.json            # Hardcoded destination data
│   └── packages.json                # Hardcoded package data
│
├── 📁 pages/                        # Additional HTML pages
│   ├── about.html                   # About page
│   ├── contact.html                 # Contact page (separate)
│   └── (future pages)
│
└── 📁 assets/                       # Media & static files
    ├── images/                      # Product images, backgrounds
    │   ├── destinations/
    │   ├── packages/
    │   └── hero/
    └── icons/                       # SVG icons, favicons
        ├── social/
        └── ui/
```

---

## 🔍 Detailed Folder Breakdown

### **Root Level Files**

| File           | Purpose       | When You Use It                                    |
| -------------- | ------------- | -------------------------------------------------- |
| `index.html`   | Homepage      | First file browsers load; contains main navigation |
| `README.md`    | Documentation | Getting started; project overview                  |
| `STRUCTURE.md` | This guide    | Understanding the architecture                     |

---

### **📁 css/ - Stylesheets**

**Current Setup:** Single `styles.css` file

- ✅ **Good for beginners** - everything in one place
- ✅ **Easy to debug** - use browser DevTools on one file
- ✅ **Fast loading** - one HTTP request

**Why we organized it this way:**

- Uses **CSS variables** at the top `:root` for colors & spacing
- Sections are clearly commented (HEADER, HERO, BUTTONS, etc.)
- As project grows → can split into separate files

**Future scaling example:**

```
css/
├── styles.css              (main/imports)
├── components/
│   ├── header.css
│   ├── buttons.css
│   ├── cards.css
│   └── forms.css
├── layout/
│   ├── grid.css
│   └── responsive.css
└── utilities/
    └── variables.css       (colors, spacing, fonts)
```

---

### **📁 js/ - JavaScript Logic**

**Current Setup:** Single `main.js` file

- All HTML interactions in one place
- Functions clearly documented with comments
- Easy to trace how things work

**What goes in this folder:**

- `main.js` - Page initialization, event listeners, main logic
- `utils.js` (future) - Reusable helper functions
- `api.js` (future) - API calls to backend

**Example of how this scales:**

```javascript
// main.js - just imports and initializes
import { initNav } from "./modules/navigation.js";
import { initForms } from "./modules/forms.js";

// utils.js - shared functions
export function formatPrice(price) {
  return `$${price.toLocaleString()}`;
}

// api.js - backend communication (FUTURE)
export async function fetchDestinations() {
  const response = await fetch("/api/destinations");
  return response.json();
}
```

---

### **📁 data/ - Frontend Data (NO BACKEND YET)**

**Purpose:** Simulate a backend with hardcoded JSON data

- `destinations.json` - List of travel destinations
- `packages.json` - Travel packages

**Why separate from JavaScript:**

- ✅ Data is separate from logic (industry best practice)
- ✅ Easy to swap with real API later
- ✅ You can see all data at a glance

**Example structure:**

```json
// data/destinations.json
{
  "destinations": [
    {
      "id": 1,
      "name": "Paris",
      "country": "France",
      "description": "City of lights...",
      "image": "assets/images/destinations/paris.jpg",
      "rating": 4.8
    }
  ]
}
```

**Then in JavaScript:**

```javascript
// Fetch the JSON file
fetch("data/destinations.json")
  .then((response) => response.json())
  .then((data) => displayDestinations(data.destinations));
```

---

### **📁 pages/ - Multi-page Site Structure**

**Purpose:** When your site grows beyond homepage

**Example:**

- `index.html` - Homepage (main entry point)
- `pages/about.html` - About Us
- `pages/contact.html` - Contact page
- `pages/destination.html` - Individual destination details

**Navigation structure:**

```html
<nav>
  <a href="index.html">Home</a>
  <a href="pages/about.html">About</a>
  <a href="pages/contact.html">Contact</a>
</nav>
```

---

### **📁 assets/ - All Media Files**

#### **images/**

```
images/
├── destinations/         # Destination photos
├── packages/            # Package images
├── hero/                # Homepage hero images
├── backgrounds/         # Background patterns
└── team/                # Team photos (future)
```

#### **icons/**

```
icons/
├── social/              # Facebook, Instagram, etc.
├── ui/                  # Heart, star, search icons
└── favicon.ico          # Browser tab icon
```

---

## 🎯 What You'll Work With Most (As a Beginner)

### **Most Frequent Edits:**

1. **data/destinations.json** - Add/edit travel destinations
2. **index.html** - Modify HTML structure
3. **css/styles.css** - Change colors, spacing, layouts
4. **js/main.js** - Add interactivity

### **Less Frequent:**

- `pages/` - Only when adding new pages
- `assets/` - Only when adding images
- `README.md` - Update documentation

---

## 🔄 How This Structure Scales (When You Add a Backend)

### **Phase 1: Current (Frontend Only)**

```
data/
├── destinations.json     ← Load static data
└── packages.json
```

### **Phase 2: Add Backend Server**

```
You'll create a separate backend project (Node.js, Python, etc.)
Backend serves API endpoints:
  GET /api/destinations
  GET /api/packages
  POST /api/bookings
```

### **Phase 3: Updated Frontend**

```javascript
// Instead of loading JSON files...
// fetch('data/destinations.json')

// You'll call API endpoints...
// fetch('https://api.wanderlust.com/destinations')
```

**The folder structure stays the same!**

- `data/` folder becomes unnecessary (delete it)
- `js/api.js` handles all backend communication
- Rest of the site works unchanged ✅

---

## 📊 File Size Reference (Beginner Friendly)

| File                     | Typical Size | Impact                  |
| ------------------------ | ------------ | ----------------------- |
| `index.html`             | 3-5 KB       | Fast load               |
| `css/styles.css`         | 10-20 KB     | Fast load               |
| `js/main.js`             | 5-10 KB      | Fast load               |
| `data/destinations.json` | 5-10 KB      | Fast load               |
| Image (optimized)        | 50-200 KB    | Biggest impact on speed |

**Key insight:** Images are your biggest file size concern, not code!

---

## 🚀 Project Growth Path

### **Beginner Stage (Current)**

- Single CSS file
- Single JS file
- Static JSON data
- One main page

### **Intermediate Stage**

- CSS split into components
- JS split into modules
- Multiple pages
- Local storage for user preferences

### **Advanced Stage**

- Backend API
- Database
- User authentication
- Real-time updates

**Our structure supports all these levels!** 🎉

---

## ✅ Best Practices in This Structure

1. **Separation of Concerns**
   - HTML = structure
   - CSS = styling
   - JS = behavior
   - Data = content

2. **Easy to Find Things**
   - Images go in `assets/`
   - Styles go in `css/`
   - Logic goes in `js/`
   - Data goes in `data/`

3. **Easy to Scale**
   - Can add more files to each folder
   - Don't need to reorganize everything
   - Backend swap is straightforward

4. **Beginner Friendly**
   - Not too many folders (overwhelming)
   - Not too few (confusing)
   - Clear naming conventions

---

## 📝 Quick Reference

| Need to...       | Go to...                                  |
| ---------------- | ----------------------------------------- |
| Change colors    | `css/styles.css` (look for CSS variables) |
| Add destinations | `data/destinations.json`                  |
| Add a button     | `index.html`                              |
| Make button work | `js/main.js`                              |
| Add a page       | Create `pages/newpage.html`               |
| Add an image     | Put in `assets/images/`                   |
| Style a section  | `css/styles.css` (search section name)    |
| Debug JavaScript | Open `js/main.js` in DevTools             |

---

This structure is **professional-grade** but **beginner-friendly**. You're learning industry standards! 🚀
