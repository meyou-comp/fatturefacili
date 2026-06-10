import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Imposta a false per cancellare DAVVERO gli account. 
// Lascialo a true per fare solo una simulazione.
const DRY_RUN = true;

const BAD_DOMAINS = [
  'adt.com',
  'take2games.com',
  'michaelpage.com',
  '7-11.com',
  'nagel-group.com',
  'chameleongroup.co',
  'a7gi.ru',
];

initializeApp({
  credential: applicationDefault(),
  projectId: 'fatture-facili-2ce2b'
});

const auth = getAuth();
const db = getFirestore();

function isBotEmail(email) {
  if (!email) return false;
  email = email.toLowerCase();
  
  const [localPart, domain] = email.split('@');
  
  if (BAD_DOMAINS.includes(domain)) {
    return true;
  }
  
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const dotCount = (localPart.match(/\./g) || []).length;
    if (dotCount >= 3) {
      return true;
    }
  }
  
  return false;
}

async function runCleanup() {
  console.log(`Inizio pulizia bot. DRY_RUN è impostato a: ${DRY_RUN}\n`);
  
  let nextPageToken;
  let botCount = 0;
  let totalCount = 0;
  const botsToDelete = [];

  try {
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      for (const userRecord of listUsersResult.users) {
        totalCount++;
        if (isBotEmail(userRecord.email)) {
          botCount++;
          botsToDelete.push({
            uid: userRecord.uid,
            email: userRecord.email,
            creationTime: userRecord.metadata.creationTime
          });
        }
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Trovati ${botCount} bot su ${totalCount} utenti totali.\n`);

    if (botsToDelete.length === 0) {
      console.log("Nessun bot trovato. Esco.");
      return;
    }

    if (DRY_RUN) {
      console.log("=== MODALITÀ DRY_RUN (Nessuna modifica verrà apportata) ===");
      console.log("Ecco i bot che verrebbero eliminati:");
      botsToDelete.forEach(b => console.log(`- ${b.email} (Creato il: ${b.creationTime})`));
      console.log("\nPer cancellarli davvero, cambia DRY_RUN = false nel file cleanup.js e riesegui.");
    } else {
      console.log("=== MODALITÀ ELIMINAZIONE ATTIVA ===");
      for (const bot of botsToDelete) {
        console.log(`Eliminazione in corso: ${bot.email} (${bot.uid})...`);
        
        try {
          await db.collection('users').doc(bot.uid).delete();
        } catch (e) {
          console.log(`  [Firestore] Errore o documento non trovato per ${bot.uid}`);
        }

        try {
          await auth.deleteUser(bot.uid);
          console.log(`  [Auth] Eliminato con successo.`);
        } catch (e) {
          console.log(`  [Auth] Errore eliminazione: ${e.message}`);
        }
      }
      console.log("\nPulizia completata!");
    }

  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
  }
}

runCleanup();
