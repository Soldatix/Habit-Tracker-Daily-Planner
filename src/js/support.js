export const SUPPORT = {
  paypal: 'https://www.paypal.com/ncp/payment/RU2CWCNVQ7XD6',
  stripe: 'https://buy.stripe.com/7sYeVd7Blfe89cm0k02kw00',
  crypto: [
    ['BTC', 'bc1qwlrxrh64peukga0fp59m9yg7gpf0yj8q7fxnsc'],
    ['ETH', '0xA99A52085c6725854daa46bb302041569c8bA4E3'],
    ['XRP', 'rP43SsrkhPkxTsFohMAm32sAQg7vqwmDpr'],
    ['SOL', '8xkdVTEaDGuWu4aE3HpEx8r9Aux98JZbdsMiDQvJWBWR'],
    ['DOGE', 'DGAT32ku8WmFaTDxCgVuRuVpUFmfdmD5Jb'],
    ['XLM', 'GCYH4OD4I2GNRKFFOYROE3N3S2HCT5RXIML3TZV5DP3TLTLXPXQXIJZ3'],
    ['LTC', 'LWtaFniqdYpv2xJtqo9WqDwCsQ2cW6PYWi'],
    ['RVN', 'RAtXzKZyB3awfq2u2cK8YppC9kJamU5tPQ'],
  ],
};

const walletIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A2.5 2.5 0 0 1 3 17V7a2.5 2.5 0 0 1 2.5-2.5H17"/>
    <path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z"/>
  </svg>`;

const cardIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="M3 9h18M7 15h4"/>
  </svg>`;

function paymentBadges(items) {
  return `<div class="payment-badges">${items.map((item) => `<span class="payment-badge">${item}</span>`).join('')}</div>`;
}

export function renderSupportSection(t) {
  return `
    <section class="apps-games-support" aria-labelledby="supportTitle">
      <div class="support-kicker">ℹ ${t('supportEyebrow')}</div>
      <h3 id="supportTitle" class="support-project-title">${t('supportProject')}</h3>
      <p>${t('supportIntro')}</p>
      <p>${t('supportCharity')}</p>

      <h4 class="donate-heading">${t('donateHeading')}</h4>

      <div class="payment-options">
        <article class="payment-card">
          <div class="payment-brand-row">
            <span class="payment-symbol">${walletIcon}</span>
            <h4>PayPal</h4>
          </div>
          <p>${t('paypalDescription')}</p>
          ${paymentBadges(['PayPal', t('debitCredit'), 'Apple Pay'])}
          <a class="donation-button" href="${SUPPORT.paypal}" target="_blank" rel="noopener noreferrer">${t('paypalButton')} ↗</a>
        </article>

        <article class="payment-card">
          <div class="payment-brand-row">
            <span class="payment-symbol">${cardIcon}</span>
            <h4>Stripe</h4>
          </div>
          <p>${t('stripeDescription')}</p>
          ${paymentBadges([t('debitCredit'), 'Link', t('digitalWallets')])}
          <a class="donation-button" href="${SUPPORT.stripe}" target="_blank" rel="noopener noreferrer">${t('stripeButton')} ↗</a>
        </article>
      </div>

      <p class="payment-note">${t('paymentNote')}</p>

      <section class="crypto-standard" aria-labelledby="cryptoTitle">
        <h4 id="cryptoTitle">${t('cryptoWallet')}</h4>
        <p>${t('cryptoSupportText')}</p>
        <div class="crypto-list">
          ${SUPPORT.crypto.map(([coin, address]) => `
            <div class="crypto-row">
              <strong>${coin}</strong>
              <code title="${address}">${address}</code>
              <button class="copy-button" type="button" data-copy-address="${address}">${t('copy')}</button>
            </div>`).join('')}
        </div>
      </section>
    </section>`;
}
