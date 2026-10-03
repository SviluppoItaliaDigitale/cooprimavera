# Facebook e Instagram: accesso tramite API Meta

Configurato il 03/10/2026. Serve a gestire la pagina Facebook
[Cooprimavera](https://www.facebook.com/Cooprimavera) e l'account Instagram
[@cooprimaverasoccoop](https://www.instagram.com/cooprimaverasoccoop) senza
entrare a mano nelle app. Per ora nessuna pubblicazione automatica: il sito non
ha una sezione news.

## Configurazione

- Portfolio Meta «Cooprimavera Soc. Coop.» (ID 1069171093648181).
- Pagina Cooprimavera (ID 192102847559438), collegata a Instagram
  @cooprimaverasoccoop (ID 17841450942594163).
- App Meta «Sito Cooprimavera» (ID 1755372812353047), casi d'uso: Pagina,
  Instagram, Messenger. Non pubblicata (non serve per gestire i propri asset).
- Utente di sistema **sito-web** (ID 61594884729022, Admin): pagina in accesso
  completo, app con ruolo «Sviluppa l'app». Instagram risulta senza
  assegnazione diretta (nel portfolio c'è «Accesso richiesto»), ma funziona
  attraverso la pagina collegata.

## Secret GitHub del repository

| Secret | Contenuto |
|---|---|
| `META_PAGE_ID` | ID della pagina |
| `META_PAGE_TOKEN` | token della pagina, **non scade** |
| `META_IG_USER_ID` | ID dell'account Instagram collegato |

Il token non va mai scritto nei file né incollato in chat.

## Permessi del token

`pages_show_list`, `pages_read_engagement`, `pages_read_user_content`,
`pages_manage_posts`, `pages_manage_engagement`, `pages_manage_metadata`,
`pages_messaging`, `read_insights`, `instagram_basic`,
`instagram_content_publish`, `instagram_manage_contents`,
`instagram_manage_comments`, `instagram_manage_insights`,
`instagram_manage_messages`.

Abilita: pubblicare, modificare ed eliminare post su Facebook; pubblicare ed
eliminare post su Instagram; commenti, messaggi e statistiche su entrambi.

Esclusi di proposito: `business_management` (aggiungere o togliere
amministratori, persone e risorse del portfolio resta solo ad Alessandro),
permessi pubblicitari e di negozio.

Limiti della piattaforma: su Instagram un post pubblicato non si modifica (si
elimina e si ripubblica); su Facebook si riscrive il testo ma non le immagini.

## Rigenerare il token

business.facebook.com → portfolio Cooprimavera → Impostazioni → Utenti →
Utenti di sistema → sito-web → *Genera token* → app Sito Cooprimavera →
scadenza «Mai» → i permessi elencati sopra → Genera → Copia. Poi ricavare il
token della pagina con
`GET https://graph.facebook.com/v23.0/192102847559438?fields=access_token`
e aggiornare il secret `META_PAGE_TOKEN`.
