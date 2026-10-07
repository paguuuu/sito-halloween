# Rifelloween — sito con pagamenti, QR ed email

Stack: Next.js (Vercel) + Stripe Checkout + Resend (email) + Upstash Redis (database).

## Messa online (circa 20 minuti)
1. Carica questa cartella su un repo GitHub e importalo su vercel.com (New Project).
2. Vercel → Storage / Marketplace → aggiungi **Upstash Redis** al progetto (imposta da solo le variabili del database).
3. **Stripe**: crea l'account, copia la Secret key in `STRIPE_SECRET_KEY`. Poi Developers → Webhooks → Add endpoint
   `https://TUO-DOMINIO/api/webhook`, evento `checkout.session.completed`; copia il signing secret in `STRIPE_WEBHOOK_SECRET`.
4. **Gmail** (gratis): attiva la verifica in 2 passaggi sul tuo account Google, poi crea una "Password per le app" (myaccount.google.com/apppasswords). Metti la mail in `GMAIL_USER` e la password in `GMAIL_APP_PASSWORD`.
5. Imposta `BASE_URL` (il dominio finale con https) e `STAFF_PIN` nelle Environment Variables di Vercel, poi rideploya.
6. Prova tutto con le chiavi di test Stripe (carta 4242 4242 4242 4242) prima di passare alle chiavi live.

## Il giorno della festa
Apri `https://TUO-DOMINIO/staff` dal telefono, inserisci il PIN, inquadra il QR: vedi nome, cognome, anno di nascita,
formula e buffet. "Fai entrare" segna il biglietto come usato; un secondo ingresso con lo stesso QR viene bloccato.
