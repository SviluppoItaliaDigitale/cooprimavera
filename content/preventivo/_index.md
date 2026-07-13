---
title: "Preventivo e contatti"
description: "Richiedi un preventivo gratuito e senza impegno a Cooprimavera: modulo guidato, WhatsApp, telefono, email, PEC e sedi di Ariccia e Genzano di Roma."
layout: "page"
---

Hai un progetto in mente? Compila il modulo qui sotto: prepariamo il messaggio per te e lo invii con un tocco **su WhatsApp o via email**. In alternativa trovi tutti i recapiti diretti più in basso.

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
    <button type="submit" class="bottone" data-canale="whatsapp">Invia su WhatsApp</button>
    <button type="submit" class="bottone bottone-chiaro" data-canale="email">Invia via email</button>
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
  var canale = "whatsapp";
  form.querySelectorAll("button[data-canale]").forEach(function (b) {
    b.addEventListener("click", function () { canale = b.getAttribute("data-canale"); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = "Richiesta di preventivo dal sito cooprimavera.com\n"
      + "Nome: " + form.nome.value + "\n"
      + "Servizio: " + form.servizio.value + "\n"
      + "Comune: " + form.comune.value + "\n"
      + (form.recapito.value ? "Telefono: " + form.recapito.value + "\n" : "")
      + "Esigenza: " + form.messaggio.value;
    if (canale === "whatsapp") {
      window.open("https://wa.me/393317771888?text=" + encodeURIComponent(t), "_blank", "noopener");
    } else {
      location.href = "mailto:info@cooprimavera.com?subject=" + encodeURIComponent("Richiesta preventivo — " + form.servizio.value) + "&body=" + encodeURIComponent(t);
    }
  });
})();
</script>

## Recapiti diretti

- **WhatsApp (il canale più rapido):** [scrivici al 331 777 1888](https://wa.me/393317771888)
- **Cellulare:** [331 777 1888](tel:+393317771888)
- **Ufficio:** [06 63 46 70](tel:+3906634670)
- **Email:** [info@cooprimavera.com](mailto:info@cooprimavera.com)
- **PEC:** [cooprimavera@pec.it](mailto:cooprimavera@pec.it)

## Le nostre sedi

- **Sede operativa (ufficio e magazzino):** Via Giuseppe Lugli 2/4 — 00072 Ariccia (RM)
- **Sede legale:** Viale Don Morosini 100 — 00045 Genzano di Roma (RM)

![Mappa della sede operativa di Via Giuseppe Lugli, Ariccia](img/mappa-sede.png)

*Mappa © OpenStreetMap contributors — [apri il percorso in Google Maps](https://www.google.com/maps/dir//Via+Giuseppe+Lugli+2,+00072+Ariccia+RM)*

**P.IVA:** 09176751007
