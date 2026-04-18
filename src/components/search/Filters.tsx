'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Electrical', value: 'electrical' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Carpentry', value: 'carpentry' },
  { label: 'Painting', value: 'painting' },
]

const LOCATIONS = [
  { label: 'Beirut', value: 'beirut' },
  { label: 'Tripoli', value: 'tripoli' },
  { label: 'Sidon', value: 'sidon' },
  { label: 'Tyre', value: 'tyre' },
]

const RATINGS = [
  { stars: '★☆☆☆☆', label: '1 & up', value: '1' },
  { stars: '★★☆☆☆', label: '2 & up', value: '2' },
  { stars: '★★★☆☆', label: '3 & up', value: '3' },
  { stars: '★★★★☆', label: '4 & up', value: '4' },
  { stars: '★★★★★', label: '5 only', value: '5' },
]

const selectClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none cursor-pointer"

export default function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') ?? ''
  const currentLocation = searchParams.get('location') ?? ''
  const currentRating = searchParams.get('minRating') ?? ''
  const currentMaxPrice = searchParams.get('maxPrice') ?? ''

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleRating = (value: string) => {
    updateParam('minRating', currentRating === value ? '' : value)
  }

  const hasActiveFilters = currentCategory || currentLocation || currentRating || currentMaxPrice

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-red-400 hover:text-red-600 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="px-4 py-4 border-b border-gray-100">
        <label className="block text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
          Category
        </label>
        <select
          value={currentCategory}
          onChange={(e) => updateParam('category', e.target.value)}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="px-4 py-4 border-b border-gray-100">
        <label className="block text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
          Location
        </label>
        <select
          value={currentLocation}
          onChange={(e) => updateParam('location', e.target.value)}
          className={selectClass}
        >
          <option value="">All locations</option>
          {LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Max Price
          </label>
          {currentMaxPrice ? (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              ${currentMaxPrice}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Any</span>
          )}
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={currentMaxPrice || '500'}
          onChange={(e) =>
            updateParam('maxPrice', e.target.value === '500' ? '' : e.target.value)
          }
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-300">$0</span>
          <span className="text-xs text-gray-300">$500+</span>
        </div>
      </div>

      {/* Rating */}
      <div className="px-4 py-4">
        <label className="block text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
          Min Rating
        </label>
        <div className="flex flex-col gap-1">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => toggleRating(r.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition border ${
                currentRating === r.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span className="tracking-tighter">{r.stars}</span>
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}