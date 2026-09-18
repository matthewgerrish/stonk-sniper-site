/* ============================================================
   STONK SNIPER — site behaviour
   Deliberately small: the share calculator runs entirely in the
   browser, and the contract copy button. No wallet connection,
   no address is sent anywhere, no analytics.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- share calculator ---------- */

  var balanceEl = document.getElementById("balance");
  var supplyEl = document.getElementById("supply");
  var shareEl = document.getElementById("share");
  var deliveryEl = document.getElementById("delivery");

  /** Parse a human-typed amount: strips spaces, commas and underscores. */
  function parseAmount(raw) {
    if (typeof raw !== "string") return NaN;
    var cleaned = raw.replace(/[\s,_]/g, "");
    if (cleaned === "") return NaN;
    if (!/^\d*\.?\d*$/.test(cleaned)) return NaN;
    var n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  /**
   * Format a share as a percentage with enough precision to stay meaningful
   * for very small holders, who are the ones most likely to be looking.
   */
  function formatPercent(fraction) {
    var pct = fraction * 100;
    if (pct === 0) return "0%";
    if (pct >= 1) return pct.toFixed(2) + "%";
    if (pct >= 0.01) return pct.toFixed(3) + "%";
    if (pct >= 0.0001) return pct.toFixed(5) + "%";
    return pct.toExponential(2) + "%";
  }

  /* Rent facts, mirrored from the engine's shared package so the copy here
     cannot drift from what the engine actually charges. */
  var ATA_RENT_SOL = 0.00203928;
  var COINS_PER_ROUND = 25;

  function describeDelivery(fraction) {
    var rentPerHolder = ATA_RENT_SOL * COINS_PER_ROUND;
    return (
      "Pushed if your share clears that round's rent line, otherwise claimable. " +
      "Pushing one holder costs the engine " +
      rentPerHolder.toFixed(5) +
      " SOL in account rent."
    );
  }

  function recalculate() {
    if (!shareEl || !deliveryEl) return;

    var balance = parseAmount(balanceEl ? balanceEl.value : "");
    var supply = parseAmount(supplyEl ? supplyEl.value : "");

    var balanceBad = balanceEl && balanceEl.value !== "" && Number.isNaN(balance);
    var supplyBad = supplyEl && supplyEl.value !== "" && Number.isNaN(supply);

    if (balanceEl) balanceEl.setAttribute("aria-invalid", balanceBad ? "true" : "false");
    if (supplyEl) supplyEl.setAttribute("aria-invalid", supplyBad ? "true" : "false");

    if (Number.isNaN(balance) || Number.isNaN(supply)) {
      shareEl.textContent = "—";
      deliveryEl.textContent = balanceBad || supplyBad
        ? "Enter digits only"
        : "Enter a balance";
      return;
    }

    if (supply <= 0) {
      shareEl.textContent = "—";
      deliveryEl.textContent = "Eligible supply must be greater than zero";
      return;
    }

    if (balance > supply) {
      shareEl.textContent = "—";
      deliveryEl.textContent = "A balance cannot exceed the eligible supply";
      return;
    }

    var fraction = balance / supply;
    shareEl.textContent = formatPercent(fraction);
    deliveryEl.textContent = describeDelivery(fraction);
  }

  if (balanceEl) balanceEl.addEventListener("input", recalculate);
  if (supplyEl) supplyEl.addEventListener("input", recalculate);

  var calcForm = document.getElementById("calc");
  if (calcForm) {
    calcForm.addEventListener("submit", function (e) {
      e.preventDefault();
      recalculate();
    });
  }

  recalculate();

  /* ---------- contract copy ---------- */

  var copyBtn = document.querySelector(".copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var value = copyBtn.getAttribute("data-copy");
      if (!value) return;

      var restore = function () {
        window.setTimeout(function () {
          copyBtn.textContent = "Copy contract";
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () {
            copyBtn.textContent = "Copied";
            restore();
          },
          function () {
            copyBtn.textContent = "Press ⌘C";
            restore();
          }
        );
      } else {
        copyBtn.textContent = "Press ⌘C";
        restore();
      }
    });
  }
})();
