STUDENT VOTES
    ↓
1️⃣ INSTANT RECEIPT (Frontend)
   └─ Show immediately
   └─ Store in localStorage  
   └─ User sees it right away
   └─ No backend wait

2️⃣ SAVED RECEIPT (Backend)
   └─ POST to /api/votes/receipt
   └─ Create Receipt document
   └─ Generate HMAC-SHA256 signature
   └─ Assign unique receipt ID
   └─ Email confirmation to user

3️⃣ VERIFY RECEIPT (API)
   └─ GET /api/receipts/verify/:code
   └─ Check signature validity
   └─ Confirm votes match database
   └─ Return verification status