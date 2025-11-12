export default function Loading() {
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Hero Loading */}
      <div className="bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32 w-full">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-pulse">
              <div className="h-16 bg-gray-200 rounded mb-6 max-w-2xl mx-auto"></div>
              <div className="h-8 bg-gray-200 rounded mb-12 max-w-3xl mx-auto"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="w-48 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-48 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Loading */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="w-full">
              <div className="mb-8 animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-2 max-w-md"></div>
                <div className="w-24 h-1 bg-gray-200 rounded"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(12)].map((_, cardIndex) => (
                  <div key={cardIndex} className="animate-pulse">
                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-100">
                      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
