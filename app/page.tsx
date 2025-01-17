import CurrencyConverter from "./components/CurrencyConverter";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 py-10">
      <div className="bg-indigo-50 shadow-lg border border-indigo-300 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-rose-500 mb-4 text-center select-none">
          Currency Converter
        </h2>
        <CurrencyConverter />
      </div>
    </div>
  );
}
