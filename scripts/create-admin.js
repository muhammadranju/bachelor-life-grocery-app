const admin = require("firebase-admin");
const serviceAccount = require("../service_account.json");

// Initialize Firebase Admin with Service Account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const createUser = async () => {
    // Configuration for the new user
  const email = "admin@test.com"; 
  const password = "password123";
  const displayName = "Admin User";

  try {
    console.log(`Checking if user ${email} exists...`);
    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log("User already exists with UID:", userRecord.uid);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log("User not found as expected. Creating new user...");
            userRecord = await admin.auth().createUser({
                email,
                password,
                displayName,
            });
            console.log("Successfully created new user:", userRecord.uid);
        } else {
            throw e;
        }
    }

    // Initialize Firestore
    const db = admin.firestore();
    
    // Create/Update Firestore User Record
    // (This matches your app's 'users' collection schema)
    console.log("Updating Firestore profile...");
    await db.collection("users").doc(userRecord.uid).set({
      name: displayName,
      email: email,
      role: "admin", // Crucial for your Admin Check logic
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log("-----------------------------------------");
    console.log("✅ SUCCESS: Admin User Ready");
    console.log(`📧 Email: ${email}`);
    console.log(`PW Password: ${password}`);
    console.log("-----------------------------------------");
    
    // Suggest next step
    console.log("You can now login with these credentials in the app.");

  } catch (error) {
    console.error("❌ Error creating user:", error);
  }
};

createUser();
