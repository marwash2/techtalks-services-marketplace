export default function Input({ placeholder }: { placeholder?: string }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}
