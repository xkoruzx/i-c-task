const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

/**
 * Scheduled function to run every day at midnight (00:00).
 * Deletes tasks that have been 'finished' for more than 30 days.
 */
exports.scheduledCleanup = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    const RETENTION_DAYS = 30;
    const now = new Date();
    const retentionDate = new Date(now.setDate(now.getDate() - RETENTION_DAYS));

    console.log(`Running cleanup for tasks finished before ${retentionDate.toISOString()}`);

    const snapshot = await db.collection("tasks")
        .where("status", "==", "finished")
        .where("completedAt", "<=", admin.firestore.Timestamp.fromDate(retentionDate))
        .get();

    if (snapshot.empty) {
        console.log("No matching tasks found.");
        return null;
    }

    const batch = db.batch();
    let deleteCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Delete proof image if exists
        if (data.proof && data.proof.imageUrl) {
            try {
                // Extract path from URL or store path in DB. 
                // Storing path is better, but here we might need to parse URL if path isn't saved.
                // Assumption: we have a way to get the file reference.
                // For simplify: assumes we stored 'storagePath' or similar, OR we parse it.
                // Here we just log.
                console.log(`Should delete image: ${data.proof.imageUrl}`);
            } catch (e) {
                console.error("Error deleting image", e);
            }
        }

        batch.delete(doc.ref);
        deleteCount++;
    }

    await batch.commit();
    console.log(`Deleted ${deleteCount} old tasks.`);
    return null;
});

/**
 * Callable function for manual admin cleanup (alternative to client-side).
 */
exports.manualCleanup = functions.https.onCall(async (data, context) => {
    // Check auth
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    // Implement similar logic to client-side cleanup here for security/performance on large datasets
});
