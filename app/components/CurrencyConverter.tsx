"use client";

import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import NumberFlow from "@number-flow/react";

const currencies: Currency[] = [
  { code: "USD", flag: "/flags/us.svg" },
  { code: "EUR", flag: "/flags/eu.svg" },
  { code: "JPY", flag: "/flags/jp.svg" },
  { code: "GBP", flag: "/flags/gb.svg" },
  { code: "CAD", flag: "/flags/ca.svg" },
  { code: "CHF", flag: "/flags/ch.svg" },
  { code: "CNY", flag: "/flags/cn.svg" },
  { code: "SN", flag: "/flags/sn.svg" },
];

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [amountFrom, setAmountFrom] = useState<string>("");
  const [amountTo, setAmountTo] = useState<string>("");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>("");
  const [isLoading, startTransition] = useTransition();
  const [showDropdownFrom, setShowDropdownFrom] = useState<boolean>(false);
  const [showDropdownTo, setShowDropdownTo] = useState<boolean>(false);

  const toggleFromDropdown = () => {
    setShowDropdownFrom((prev) => !prev);
    if (!showDropdownFrom) setShowDropdownTo(false);
  };

  const toggleToDropdown = () => {
    setShowDropdownTo((prev) => !prev);
    if (!showDropdownTo) setShowDropdownFrom(false);
  };

  const handleAmountChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountFrom(e.target.value);
    if (rates[toCurrency]) {
      const convertedAmount = (
        parseFloat(e.target.value) * rates[toCurrency]
      ).toFixed(2);
      setAmountTo(isNaN(parseFloat(convertedAmount)) ? "" : convertedAmount);
    }
  };

  const handleAmountChangeTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountTo(e.target.value);
    if (rates[toCurrency]) {
      const convertedAmount = (
        parseFloat(e.target.value) / rates[toCurrency]
      ).toFixed(2);
      setAmountFrom(isNaN(parseFloat(convertedAmount)) ? "" : convertedAmount);
    }
  };

  const handleFromCurrencySelect = (code: string) => {
    setFromCurrency(code);
    setShowDropdownFrom(false);
  };

  const handleToCurrencySelect = (code: string) => {
    setToCurrency(code);
    setShowDropdownTo(false);
  };

  const handleConvert = () => {
    startTransition(() => {
      if (!amountFrom || !rates[toCurrency]) {
        setError("Please enter an amount and ensure currencies are selected");
        return;
      }

      const convertedAmount = (
        parseFloat(amountFrom) * rates[toCurrency]
      ).toFixed(2);
      setAmountTo(convertedAmount);
      setError("");
    });
  };

  useEffect(() => {
    const fetchRates = async () => {
      if (!API_KEY) {
        setError("API key not configured");
        return;
      }

      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
        );
        const data = await response.json();
        if (data.result === "success") {
          setRates(data.conversion_rates);
          //! Update the conversion if there's an amount already entered
          if (amountFrom) {
            const convertedAmount = (
              parseFloat(amountFrom) * data.conversion_rates[toCurrency]
            ).toFixed(2);
            setAmountTo(convertedAmount);
          }
          setError("");
        } else {
          setError("Failed to fetch rates");
        }
      } catch (error) {
        setError("Error fetching exchange rates");
      }
    };

    fetchRates();
  }, [fromCurrency, toCurrency, API_KEY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".currency-dropdown")) {
        setShowDropdownFrom(false);
        setShowDropdownTo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-lg border border-gray-200 p-5 rounded-lg max-w-md mx-auto">
      <div className="space-y-5">
        {/* From Currency */}
        <div className="flex items-center space-x-2 relative">
          <div className="relative flex-grow">
            <div className="absolute inset-0 z-20 pointer-events-none">
              <NumberFlow
                value={Number(amountFrom)}
                className="w-full h-full flex items-center px-2"
              />
            </div>

            <input
              type="number"
              id="fromCurrency"
              value={amountFrom}
              onChange={handleAmountChangeFrom}
              className="relative w-full border border-gray-300 p-2 rounded-lg outline-none bg-transparent z-10 text-white"
              // placeholder="Enter amount"
            />

            <label
              htmlFor="fromCurrency"
              className="absolute inset-0 flex items-center px-2 text-gray-500 pointer-events-none"
            >
              {!amountFrom && ""}
            </label>
          </div>

          <div className="relative currency-dropdown">
            <button
              onClick={toggleFromDropdown}
              className="flex items-center justify-between bg-gray-100 border border-gray-300 p-2 gap-1 rounded-lg w-24 h-10"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={
                    currencies.find((c) => c.code === fromCurrency)?.flag || ""
                  }
                  alt={`${fromCurrency} flag`}
                  width={20}
                  height={15}
                  className="object-cover"
                />
                <span className="text-sm font-semibold">{fromCurrency}</span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform duration-500 ${
                  showDropdownFrom ? "transform rotate-180" : ""
                } text-gray-700 ml-2`}
              />
            </button>
            {showDropdownFrom && (
              <div className="absolute top-full left-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-36 max-h-60 overflow-y-auto z-10">
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    onClick={() => handleFromCurrencySelect(currency.code)}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Image
                      src={currency.flag}
                      alt={`${currency.code} flag`}
                      width={20}
                      height={16}
                      className="mr-2"
                    />
                    {currency.code}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* To Currency */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-0 z-20 pointer-events-none">
              <NumberFlow
                value={Number(amountTo)}
                className="w-full h-full flex items-center px-2"
              />
            </div>

            <input
              type="number"
              id="fromCurrency"
              value={amountTo}
              onChange={handleAmountChangeTo}
              className="relative w-full border border-gray-300 p-2 rounded-lg outline-none bg-transparent z-10 text-white"
              // placeholder="Enter amount"
            />

            <label
              htmlFor="fromCurrency"
              className="absolute inset-0 flex items-center px-2 text-gray-500 pointer-events-none"
            >
              {!amountFrom && ""}
            </label>
          </div>
          <div className="relative currency-dropdown">
            <button
              onClick={toggleToDropdown}
              className="flex items-center bg-gray-100 border border-gray-300 p-2 gap-1 rounded-lg w-24 h-10"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={
                    currencies.find((c) => c.code === toCurrency)?.flag || ""
                  }
                  alt={`${toCurrency} flag`}
                  width={20}
                  height={15}
                  className="object-cover"
                />
                <span className="text-sm font-semibold">{toCurrency}</span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform duration-500 ${
                  showDropdownTo ? "transform rotate-180" : ""
                } text-gray-700 ml-2`}
              />
            </button>
            {showDropdownTo && (
              <div className="absolute top-full left-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-36 max-h-60 overflow-y-auto z-10">
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    onClick={() => handleToCurrencySelect(currency.code)}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Image
                      src={currency.flag}
                      alt={`${currency.code} flag`}
                      width={20}
                      height={16}
                      className="mr-2"
                    />
                    {currency.code}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      {/* <button
        onClick={handleConvert}
        className="bg-black text-white p-2 rounded-lg w-full mt-5 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        disabled={isLoading || !amountFrom}
      >
        {isLoading ? "Converting..." : "Convert"}
      </button> */}

      <p className="flex justify-center text-sm text-gray-500 mt-4">
        1 {fromCurrency} ={" "}
        {rates[toCurrency] ? rates[toCurrency].toFixed(2) : "-"} {toCurrency}
      </p>
    </div>
  );
}
