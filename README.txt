MOTIFORA SERVER FIX

Your existing server.js contains:
  require("./adminApi")(app);

This fix includes the matching adminApi.js export style (a function accepting app).

HOW TO APPLY:
1. Stop the backend (Ctrl+C).
2. Copy server/adminApi.js from this ZIP into C:\Users\karri\svg-design-store\server\adminApi.js and overwrite the existing file.
3. Keep your existing server.js line as require("./adminApi")(app); DO NOT change it to app.use(...).
4. Ensure these dependencies are installed inside server:
   npm install bcryptjs jsonwebtoken multer
5. Ensure server/.env contains a long JWT_SECRET and ADMIN_EMAIL and ADMIN_PASSWORD. Do not share .env.
6. Restart: npm start

This fixes the module export mismatch. It does not replace your existing server.js or frontend files.
