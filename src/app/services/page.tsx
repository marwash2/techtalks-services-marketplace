
import SearchBar from '@/components/search/SearchBar'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchBar />
      </Suspense>
    </div>
  )
}



/*export default function Page() {
  return <div>Services Page</div>;
}
*/