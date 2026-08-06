(() => {
  "use strict";

  // Paste the deployed /exec URL from docs/google-sheets-endpoint.gs.
  // The receiver is bound server-side to the Technology Horizons spreadsheet.
  const TECHNOLOGY_HORIZONS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwLDZWEpgJpI2Lf6TLkbw0h3wY7sj7bVsXaUWP5tm0XNJX_zS5I1B-EHyvMGvfq3IqVhg/exec";
  const FETCH_MODE = "no-cors";

  const copy = {
    pl: {
      close: "Zamknij",
      submit: "Wyślij",
      sending: "Wysyłanie…",
      required: "Uzupełnij wymagane pola.",
      demo: "Dziękujemy — formularz jest gotowy, ale endpoint nie został jeszcze skonfigurowany.",
      success: "Dziękujemy. Zgłoszenie zostało wysłane.",
      error: "Nie udało się wysłać formularza. Spróbuj ponownie lub skontaktuj się bezpośrednio z organizatorem.",
      talkTitle: "Zaproponuj temat lub wystąpienie",
      talkIntro: "Opisz krótko temat, format i preferowany język. Prelekcje mogą odbywać się po polsku albo po angielsku.",
      contactTitle: "Kontakt",
      contactIntro: "Napisz, jeżeli chcesz zapytać o wydarzenie, partnerstwo, udział społeczności lub współpracę.",
      name: "Imię i nazwisko",
      email: "Email",
      organisation: "Organizacja / uczelnia / firma",
      topic: "Tytuł lub temat",
      language: "Preferowany język",
      languagePlaceholder: "Wybierz",
      polish: "Polski",
      english: "English",
      either: "Obojętnie / do ustalenia",
      format: "Format",
      formatPlaceholder: "Wybierz format",
      lightning: "Krótka prezentacja / lightning talk",
      talk: "Prelekcja 25–35 minut",
      demo: "Demo / case study",
      panel: "Panel / dyskusja",
      workshop: "Warsztat",
      message: "Wiadomość",
      messageTalk: "Krótki opis tematu, dla kogo jest przeznaczony i co uczestnicy wyniosą ze spotkania",
      messageContact: "Twoja wiadomość",
      consent: "Zgadzam się na kontakt w sprawie tego zgłoszenia.",
      website: "LinkedIn lub strona internetowa",
      optional: "opcjonalnie"
    },
    en: {
      close: "Close",
      submit: "Submit",
      sending: "Sending…",
      required: "Please complete the required fields.",
      demo: "Thank you — the form is ready, but the endpoint has not been configured yet.",
      success: "Thank you. Your submission has been sent.",
      error: "The form could not be sent. Please try again or contact the organiser directly.",
      talkTitle: "Suggest a topic or talk",
      talkIntro: "Briefly describe the topic, format and preferred language. Talks may be in Polish or English.",
      contactTitle: "Contact",
      contactIntro: "Write to us about the event, partnership, community participation or collaboration.",
      name: "Name",
      email: "Email",
      organisation: "Organisation / university / company",
      topic: "Title or topic",
      language: "Preferred language",
      languagePlaceholder: "Select",
      polish: "Polish",
      english: "English",
      either: "Either / to be agreed",
      format: "Format",
      formatPlaceholder: "Select format",
      lightning: "Lightning talk",
      talk: "25–35 minute talk",
      demo: "Demo / case study",
      panel: "Panel / discussion",
      workshop: "Workshop",
      message: "Message",
      messageTalk: "Short description of the topic, who it is for, and what participants will learn",
      messageContact: "Your message",
      consent: "I agree to be contacted about this submission.",
      website: "LinkedIn or website",
      optional: "optional"
    }
  };

  const language = document.documentElement.lang && document.documentElement.lang.startsWith("en") ? "en" : "pl";
  const t = copy[language];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function dialogMarkup(type) {
    const isTalk = type === "talk";
    const title = isTalk ? t.talkTitle : t.contactTitle;
    const intro = isTalk ? t.talkIntro : t.contactIntro;
    const messagePlaceholder = isTalk ? t.messageTalk : t.messageContact;

    return `
      <dialog class="modal" id="${type}-dialog" aria-labelledby="${type}-dialog-title">
        <form class="modal__panel" data-submission-form data-form-type="${type}" novalidate>
          <button class="modal__close" type="button" data-close-dialog aria-label="${escapeHtml(t.close)}">×</button>
          <h2 id="${type}-dialog-title">${escapeHtml(title)}</h2>
          <p>${escapeHtml(intro)}</p>
          <div class="honeypot" aria-hidden="true">
            <label>Website <input name="website_url" tabindex="-1" autocomplete="off"></label>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="${type}-name">${escapeHtml(t.name)}</label>
              <input id="${type}-name" name="name" autocomplete="name" required>
            </div>
            <div class="form-field">
              <label for="${type}-email">${escapeHtml(t.email)}</label>
              <input id="${type}-email" name="email" type="email" autocomplete="email" required>
            </div>
            <div class="form-field">
              <label for="${type}-organisation">${escapeHtml(t.organisation)} <span class="muted">(${escapeHtml(t.optional)})</span></label>
              <input id="${type}-organisation" name="organisation" autocomplete="organization">
            </div>
            <div class="form-field">
              <label for="${type}-website">${escapeHtml(t.website)} <span class="muted">(${escapeHtml(t.optional)})</span></label>
              <input id="${type}-website" name="profile_url" inputmode="url" autocomplete="url">
            </div>
            ${isTalk ? `
              <div class="form-field form-field--full">
                <label for="${type}-topic">${escapeHtml(t.topic)}</label>
                <input id="${type}-topic" name="topic" required>
              </div>
              <div class="form-field">
                <label for="${type}-language">${escapeHtml(t.language)}</label>
                <select id="${type}-language" name="preferred_language" required>
                  <option value="">${escapeHtml(t.languagePlaceholder)}</option>
                  <option value="pl">${escapeHtml(t.polish)}</option>
                  <option value="en">${escapeHtml(t.english)}</option>
                  <option value="either">${escapeHtml(t.either)}</option>
                </select>
              </div>
              <div class="form-field">
                <label for="${type}-format">${escapeHtml(t.format)}</label>
                <select id="${type}-format" name="format" required>
                  <option value="">${escapeHtml(t.formatPlaceholder)}</option>
                  <option value="lightning">${escapeHtml(t.lightning)}</option>
                  <option value="talk">${escapeHtml(t.talk)}</option>
                  <option value="demo">${escapeHtml(t.demo)}</option>
                  <option value="panel">${escapeHtml(t.panel)}</option>
                  <option value="workshop">${escapeHtml(t.workshop)}</option>
                </select>
              </div>` : ""}
            <div class="form-field form-field--full">
              <label for="${type}-message">${escapeHtml(t.message)}</label>
              <textarea id="${type}-message" name="message" required placeholder="${escapeHtml(messagePlaceholder)}"></textarea>
            </div>
            <div class="form-field form-field--full">
              <label class="checkbox-label">
                <input type="checkbox" name="consent" value="yes" required>
                <span>${escapeHtml(t.consent)}</span>
              </label>
            </div>
          </div>
          <div class="form-footer">
            <button class="button button--primary" type="submit">${escapeHtml(t.submit)}</button>
            <span class="form-status" role="status" aria-live="polite"></span>
          </div>
        </form>
      </dialog>`;
  }

  function openDialog(type) {
    const dialog = document.getElementById(`${type}-dialog`);
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(button) {
    const dialog = button.closest("dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  async function submitForm(form) {
    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector("button[type='submit']");

    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) {
        status.textContent = t.required;
        status.dataset.tone = "error";
      }
      return;
    }

    const formData = new FormData(form);
    if (formData.get("website_url")) {
      form.reset();
      form.closest("dialog")?.close();
      return;
    }

    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    payload.form_type = form.dataset.formType || "unknown";
    payload.page_url = window.location.href;
    payload.page_title = document.title;
    payload.site_language = language;
    payload.submitted_at = new Date().toISOString();
    payload.referrer = document.referrer || "";

    if (status) {
      status.textContent = t.sending;
      status.dataset.tone = "";
    }
    if (submitButton) submitButton.disabled = true;

    try {
      if (!TECHNOLOGY_HORIZONS_ENDPOINT) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        if (status) {
          status.textContent = t.demo;
          status.dataset.tone = "success";
        }
        return;
      }

      await fetch(TECHNOLOGY_HORIZONS_ENDPOINT, {
        method: "POST",
        mode: FETCH_MODE,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      form.reset();
      if (status) {
        status.textContent = t.success;
        status.dataset.tone = "success";
      }
    } catch (error) {
      console.error("Submission failed", error);
      if (status) {
        status.textContent = t.error;
        status.dataset.tone = "error";
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("beforeend", dialogMarkup("talk") + dialogMarkup("contact"));

    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-open-dialog]");
      if (opener) {
        event.preventDefault();
        openDialog(opener.getAttribute("data-open-dialog"));
        return;
      }

      const closer = event.target.closest("[data-close-dialog]");
      if (closer) {
        event.preventDefault();
        closeDialog(closer);
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-submission-form]");
      if (!form) return;
      event.preventDefault();
      submitForm(form);
    });

    document.querySelectorAll("dialog.modal").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
  });
})();
