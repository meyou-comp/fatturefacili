'use server';

import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inizializza Firebase Admin se non è già stato fatto
if (!getApps().length) {
  try {
    initializeApp({
      credential: applicationDefault(),
      projectId: 'fatture-facili-2ce2b' // Hardcoded dal tuo firebase.ts
    });
  } catch (error) {
    console.warn("Firebase Admin init fallito (ignora se sei in locale senza credenziali ADC):", error);
  }
}

export async function submitWaitlistAction(email: string, turnstileToken: string) {
  // 1. Verifica Turnstile
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY mancante! Simulo successo per lo sviluppo locale.");
  } else {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', turnstileToken);

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });
      const outcome = await res.json();
      
      if (!outcome.success) {
        return { success: false, error: "Verifica anti-bot (Turnstile) fallita." };
      }
    } catch (error) {
      return { success: false, error: "Errore di rete durante la verifica anti-bot." };
    }
  }

  // 2. Salvataggio su Firestore
  try {
    const db = getFirestore();
    await db.collection('waitlist').add({
      email,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Errore salvataggio Firebase Admin:", error);
    return { 
      success: false, 
      error: "Impossibile salvare sul server. Se sei in locale, mancano le credenziali ADC. Aggiorna le regole Firestore per testare lato client, oppure testa online." 
    };
  }
}
