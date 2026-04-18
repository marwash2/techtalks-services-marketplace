
import SearchBar from '@/components/search/SearchBar'
import Filters from '@/components/search/Filters'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Services</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex gap-6">
          <div className="w-64 shrink-0">
            <Filters />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <SearchBar />
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
              Results will appear here in Dev 3
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  )
}


/*export default function Page() {
  return <div>Services Page</div>;
}
*/