export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-12 gap-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
          <Loader />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Loading...
        </h2>
        <p className="text-xl text-muted-foreground">
          Preparing your marketplace experience
        </p>
      </div>
    </div>
  );
}
import Loader from "@/components/shared/Loader";
