import frankfurter from '@frankfurter/json/currency.json';
import { NextPage } from 'next';
import { useCallback, useState } from 'react';

const { rates = {}, base = 'EUR' } = frankfurter as {
  rates: Record<string, number>;
  base: string;
};
const BASE = base ?? 'EUR';
const CURRENCIES = [BASE, ...Object.keys(rates)].sort();

const CURRENCY_NAMES: Record<string, string> = {
  AUD: 'Australian Dollar',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli Shekel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Króna',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Złoty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  ZAR: 'South African Rand',
};

// Convert any currency to EUR base, then to target
function toEur(amount: number, currency: string): number {
  if (currency === BASE) return amount;
  return amount / rates[currency];
}

function fromEur(amount: number, currency: string): number {
  if (currency === BASE) return amount;
  return amount * rates[currency];
}

function convert(amount: number, from: string, to: string): number {
  return fromEur(toEur(amount, from), to);
}

const AppPage: NextPage = () => {
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('USD');
  const [amount, setAmount] = useState<string>('1');

  const result = useCallback(() => {
    const n = parseFloat(amount);
    if (Number.isNaN(n) || n < 0) return null;
    return convert(n, from, to);
  }, [amount, from, to]);

  const converted = result();

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="bg-base-200 min-h-screen font-serif">
      {/* Header */}
      <header className="border-base-300 bg-base-100 border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-base-content/50 font-sans text-xs tracking-[0.3em] uppercase">
              Est. 2026
            </p>
            <h1 className="text-base-content text-2xl font-bold tracking-tight">
              Frankfurter
            </h1>
          </div>
          <p className="text-base-content/40 font-sans text-xs tracking-widest uppercase">
            Currency Exchange
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
        {/* Converter Card */}
        <div className="card bg-base-100 border-base-300 border shadow-xl">
          <div className="card-body gap-6">
            <div className="text-center">
              <h2 className="text-base-content/50 mb-1 font-sans text-xs tracking-[0.25em] uppercase">
                Exchange Calculator
              </h2>
              <div className="divider my-0"></div>
            </div>

            {/* Amount */}
            <div className="form-control">
              <label htmlFor="amount" className="label">
                <span className="label-text text-base-content/60 font-sans text-xs tracking-widest uppercase">
                  Amount
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input input-bordered input-lg w-full text-2xl font-bold tracking-tight"
                placeholder="1.00"
              />
            </div>

            {/* From / Swap / To */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-base-content/60 font-sans text-xs tracking-widest uppercase">
                    From
                  </span>
                </label>
                <select
                  className="select select-bordered select-lg text-lg font-bold"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} — {CURRENCY_NAMES[c]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSwap}
                className="btn btn-outline btn-square btn-lg shrink-0 self-end"
                title="Swap currencies">
                ⇄
              </button>

              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-base-content/60 font-sans text-xs tracking-widest uppercase">
                    To
                  </span>
                </label>
                <select
                  className="select select-bordered select-lg text-lg font-bold"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} — {CURRENCY_NAMES[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="bg-base-200 rounded-box border-base-300 border p-6 text-center">
              {converted !== null ? (
                <>
                  <p className="text-base-content/50 mb-2 font-sans text-xs tracking-[0.25em] uppercase">
                    {parseFloat(amount).toLocaleString()} {from} equals
                  </p>
                  <p className="text-primary text-5xl font-bold tracking-tight">
                    {converted.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                    <span className="text-base-content/60 ml-3 text-2xl">
                      {to}
                    </span>
                  </p>
                  <p className="text-base-content/40 mt-3 font-sans text-xs">
                    1 {from} ={' '}
                    {convert(1, from, to).toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 6,
                    })}{' '}
                    {to}
                  </p>
                </>
              ) : (
                <p className="text-base-content/40 font-sans text-sm">
                  Enter a valid amount above
                </p>
              )}
            </div>

            <p className="text-base-content/30 text-center font-sans text-xs tracking-wide">
              Rates based on ECB · 20 Mar 2026 · For reference only
            </p>
          </div>
        </div>

        {/* All Rates Table */}
        <div className="card bg-base-100 border-base-300 border shadow-xl">
          <div className="card-body">
            <div className="mb-2 text-center">
              <h2 className="text-base-content/50 mb-1 font-sans text-xs tracking-[0.25em] uppercase">
                All Exchange Rates
              </h2>
              <p className="text-base-content/30 font-sans text-xs">
                Base: 1 {from}
              </p>
              <div className="divider my-2"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-zebra table-sm table w-full font-sans">
                <thead>
                  <tr>
                    <th className="text-base-content/50 text-xs tracking-widest uppercase">
                      Code
                    </th>
                    <th className="text-base-content/50 text-xs tracking-widest uppercase">
                      Currency
                    </th>
                    <th className="text-base-content/50 text-right text-xs tracking-widest uppercase">
                      Rate
                    </th>
                    <th className="text-base-content/50 text-right text-xs tracking-widest uppercase">
                      Converted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CURRENCIES.filter((c) => c !== from).map((currency) => {
                    const rate = convert(1, from, currency);
                    const convertedAmt =
                      converted === null
                        ? null
                        : convert(
                            converted === 0
                              ? 1
                              : Number.parseFloat(amount) || 1,
                            from,
                            currency
                          );
                    const isTarget = currency === to;
                    return (
                      <tr
                        key={currency}
                        className={isTarget ? 'bg-primary/10 font-bold' : ''}>
                        <td>
                          <span className="badge badge-ghost badge-sm font-mono tracking-widest">
                            {currency}
                          </span>
                        </td>
                        <td className="text-base-content/70 text-xs">
                          {CURRENCY_NAMES[currency] ?? ''}
                        </td>
                        <td className="text-right text-sm tabular-nums">
                          {rate.toLocaleString(undefined, {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          })}
                        </td>
                        <td className="text-primary text-right text-sm tabular-nums">
                          {convertedAmt === null
                            ? '—'
                            : convertedAmt.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-base-300 mt-8 border-t py-6 text-center">
        <p className="text-base-content/30 font-sans text-xs tracking-widest uppercase">
          Frankfurter · Exchange Reference Tool
        </p>
      </footer>
    </div>
  );
};

export default AppPage;
