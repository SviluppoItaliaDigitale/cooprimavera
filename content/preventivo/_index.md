---
title: "Preventivo e contatti"
description: "Richiedi un preventivo gratuito e senza impegno a Cooprimavera: modulo guidato, telefono, WhatsApp, email, PEC e sedi di Ariccia e Genzano di Roma."
layout: "page"
faq:
  - domanda: "Il preventivo è davvero gratuito?"
    risposta: "Sì: il preventivo è **gratuito e senza impegno**. Per pulizie e giardinaggio comprende anche il sopralluogo, così l'offerta è precisa e senza sorprese."
  - domanda: "In quali zone operate?"
    risposta: "Lavoriamo a **Roma e in tutti i Castelli Romani** (Ariccia, Albano, Genzano, Marino, Frascati, Velletri e comuni vicini). La sede operativa è ad Ariccia."
  - domanda: "Lavorate anche con i privati o solo con le aziende?"
    risposta: "Serviamo aziende, enti pubblici, scuole, condomìni **e privati**: ogni servizio viene adattato alle dimensioni e alle esigenze del cliente."
  - domanda: "Posso chiedere un preventivo su WhatsApp?"
    risposta: "Certo: [scrivici su WhatsApp](https://wa.me/3906634670) al 06 63 46 70. Puoi anche **allegare foto o video degli ambienti**: ci aiutano a capire il lavoro e a preparare il sopralluogo."
  - domanda: "Quali prodotti usate per pulizie e sanificazioni?"
    risposta: "Prodotti professionali **Sanitec di Italchimica**, con linee **Ecolabel** e conformi ai **CAM** (Criteri Ambientali Minimi) e prodotti idonei alle procedure **HACCP** per il settore alimentare."
  - domanda: "Quali sono gli orari dell'ufficio?"
    risposta: "L'ufficio risponde **dal lunedì al giovedì dalle 9:00 alle 14:00 e il venerdì dalle 9:00 alle 18:00**. Fuori orario puoi scriverci su WhatsApp o via email: ti ricontattiamo appena possibile."
  - domanda: "Assumete personale?"
    risposta: "Siamo sempre alla ricerca di nuove persone da inserire in organico: trovi le posizioni aperte e il modulo per candidarti nella pagina [Lavora con noi](../lavora-con-noi/)."
---

Hai un progetto in mente? Compila il modulo qui sotto: prepariamo il messaggio per te e lo invii **via email con un tocco** — oppure **chiamaci o scrivici su WhatsApp**, i recapiti sono qui in basso.

## Come funziona

<ol class="passi" data-anim-group>
  <li><strong>Ci contatti</strong> Compili il modulo, chiami o scrivi su WhatsApp — anche con foto o video degli ambienti.</li>
  <li><strong>Sopralluogo gratuito</strong> Per pulizie e giardinaggio veniamo a vedere gli spazi, senza impegno.</li>
  <li><strong>Preventivo su misura</strong> Ricevi un'offerta chiara, gratuita e senza sorprese.</li>
  <li><strong>Al lavoro</strong> Interviene il nostro personale formato, con prodotti professionali certificati.</li>
</ol>

> **Nota bene:** per i servizi di **pulizie** e **giardinaggio** il sopralluogo è **obbligatorio** — il preventivo definitivo viene formulato dopo aver visto gli ambienti o le aree verdi.

<form class="modulo-preventivo" id="modulo-preventivo" data-anim="fade-up">
  <div class="campo">
    <label for="mp-nome">Nome e cognome / azienda *</label>
    <input type="text" id="mp-nome" name="nome" required autocomplete="name">
  </div>
  <div class="campo">
    <label for="mp-servizio">Servizio richiesto *</label>
    <select id="mp-servizio" name="servizio" required>
      <option value="">— scegli un servizio —</option>
      <option>Pulizie professionali</option>
      <option>Sanificazioni</option>
      <option>Disinfestazioni</option>
      <option>Giardinaggio</option>
      <option>Servizi di portierato</option>
      <option>Allestimenti per eventi</option>
      <option>Altro / più servizi</option>
    </select>
    <p class="campo-nota" id="mp-nota-sopralluogo" hidden>Per questo servizio il sopralluogo è obbligatorio: ti contatteremo per fissarlo.</p>
  </div>
  <div class="campo">
    <label for="mp-comune">Comune dell'intervento *</label>
    <input type="text" id="mp-comune" name="comune" required placeholder="es. Genzano di Roma">
  </div>
  <div class="campo">
    <label for="mp-recapito">Telefono per ricontattarti</label>
    <input type="tel" id="mp-recapito" name="recapito" autocomplete="tel">
  </div>
  <div class="campo">
    <label for="mp-messaggio">Descrivi l'esigenza (ambienti, metratura, frequenza…) *</label>
    <textarea id="mp-messaggio" name="messaggio" rows="5" required></textarea>
  </div>
  <p class="campo-nota">Inviando accetti il trattamento dei dati per rispondere alla richiesta (<a href="../privacy/">privacy policy</a>).</p>
  <div class="modulo-azioni">
    <button type="submit" class="bottone">Invia via email</button>
    <a class="bottone bottone-chiaro" href="tel:+393317771888">Oppure chiamaci: 331 777 1888</a>
    <a class="bottone bottone-chiaro" href="https://wa.me/3906634670?text=Salve%2C%20vorrei%20richiedere%20un%20preventivo." rel="noopener">Scrivici su WhatsApp</a>
  </div>
</form>

<script>
(function () {
  var form = document.getElementById("modulo-preventivo");
  if (!form) return;
  var servizio = document.getElementById("mp-servizio");
  var nota = document.getElementById("mp-nota-sopralluogo");
  servizio.addEventListener("change", function () {
    var v = servizio.value;
    nota.hidden = !(v === "Pulizie professionali" || v === "Giardinaggio");
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = "Richiesta di preventivo dal sito cooprimavera.com\n"
      + "Nome: " + form.nome.value + "\n"
      + "Servizio: " + form.servizio.value + "\n"
      + "Comune: " + form.comune.value + "\n"
      + (form.recapito.value ? "Telefono: " + form.recapito.value + "\n" : "")
      + "Esigenza: " + form.messaggio.value;
    location.href = "mailto:info@cooprimavera.com?subject=" + encodeURIComponent("Richiesta preventivo — " + form.servizio.value) + "&body=" + encodeURIComponent(t);
  });
})();
</script>

## Recapiti diretti

- **Cellulare (il canale più rapido):** [chiamaci al 331 777 1888](tel:+393317771888)
- **Ufficio:** [06 63 46 70](tel:+3906634670)
- **WhatsApp Business:** [scrivici su WhatsApp](https://wa.me/3906634670) — puoi anche inviarci foto o video degli ambienti: ci aiutano a preparare il sopralluogo
- **Email:** [info@cooprimavera.com](mailto:info@cooprimavera.com)
- **PEC:** [cooprimavera@pec.it](mailto:cooprimavera@pec.it)
- **Orari ufficio:** lun–gio 9:00–14:00 · ven 9:00–18:00

## Le nostre sedi

- **Sede operativa (ufficio e magazzino):** Via Giuseppe Lugli 2/4 — 00072 Ariccia (RM)
  **Come trovare l'ingresso:** si accede dalla via adiacente, tra il parcheggio del supermercato e l'autolavaggio.
- **Sede legale:** Viale Don Morosini 100 — 00045 Genzano di Roma (RM)

![Mappa della sede operativa di Via Giuseppe Lugli, Ariccia](img/mappa-sede.png)

*Mappa © OpenStreetMap contributors — [apri il percorso in Google Maps](https://www.google.com/maps/dir//Via+Giuseppe+Lugli+2,+00072+Ariccia+RM)*

**P.IVA:** 09176751007
