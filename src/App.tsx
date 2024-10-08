import { useState } from "react";
import { getActivities, Activity } from '@rss3/sdk';

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-row items-center justify-center w-full max-w-md mx-auto">
      <input
        type="text"
        className="w-full px-3 py-1.5 text-sm rounded-l-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
        placeholder="Search address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && onSearch(query)}
      />
      <button
        className="px-4 py-1.5 text-sm rounded-r-md text-white bg-[#0072ff] hover:bg-[#0072ff]/90 transition-colors duration-200"
        onClick={() => onSearch(query)}
      >
        Search
      </button>
    </div>
  );
};

function App() {
  const [displayedAddress, setDisplayedAddress] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDataFromRSS3 = async (query: string) => {
    if (!query) {
      setDisplayedAddress("");
      setActivities([]);
      setError(null);
      return;
    }

    setActivities([]);
    setError(null);
    setIsLoading(true);

    try {
      const result = await getActivities({
        account: query,
        limit: 20,
      });

      setActivities(result.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setDisplayedAddress(query);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col items-center justify-center gap-4 w-full mb-6">
        <img className="w-[120px]" src="https://cdn.jsdelivr.net/gh/rss3-network/rss3-assets/logo.svg" alt="RSS3 logo" />
        <h1 className="text-3xl font-bold text-center">
          Explore <span className="text-[#0072ff]">blockchain</span> activities
        </h1>
        <SearchBar onSearch={getDataFromRSS3} />
      </div>

      <div className="w-full">
        {/** Loading */}
        {isLoading && (
          <div className="text-lg font-semibold m-3 text-center text-gray-600">
            Loading...
          </div>
        )}

        {/** No Result */}
        {!isLoading && activities.length === 0 && !error && displayedAddress && (
          <div className="text-lg font-semibold m-3 text-center text-red-600">
            {`${displayedAddress} has no activities`}
          </div>
        )}

        {/** Has Error */}
        {error && (
          <div className="text-lg font-semibold m-3 text-center text-red-600">
            {error}
          </div>
        )}

        {/** Has Result */}
        {activities.length > 0 && (
          <div className="flex flex-col items-start justify-center space-y-3">
            <p className="text-xl font-bold text-[#0072ff] text-center w-full mb-4">
              {displayedAddress} has {activities.length} activit{activities.length > 1 ? 'ies' : 'y'}
            </p>
            <ul className="flex flex-col items-center justify-center w-full gap-3">
              {activities.map((activity) => (
                <li key={activity.id} className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center p-4">
                    <div className="flex-grow">
                      <div className="text-sm font-semibold text-gray-800">
                        {activity.type}{activity.platform ? ` on ${activity.platform}` : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.network} • {new Date(activity.timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                    {activity.tag && (
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        #{activity.tag}
                      </span>
                    )}
                  </div>
                  {activity.actions && activity.actions.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{activity.actions[0].type}</span>
                        {('value' in activity.actions[0].metadata) && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {activity.actions[0].metadata.value}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        {activity.actions[0].from && (
                          <div className="group relative">
                            <span className="cursor-pointer">From: {activity.actions[0].from.slice(0, 6)}...{activity.actions[0].from.slice(-4)}</span>
                            <span className="absolute left-0 top-full mt-1 w-48 rounded bg-gray-800 px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                              {activity.actions[0].from}
                            </span>
                          </div>
                        )}
                        {activity.actions[0].to && (
                          <div className="group relative">
                            <span className="cursor-pointer">To: {activity.actions[0].to.slice(0, 6)}...{activity.actions[0].to.slice(-4)}</span>
                            <span className="absolute left-0 top-full mt-1 w-48 rounded bg-gray-800 px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                              {activity.actions[0].to}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activity.actions[0].relatedUrls[0] && (
                    <div className="px-4 py-2 bg-gray-100">
                      <a href={activity.actions[0].relatedUrls[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        View on {new URL(activity.actions[0].relatedUrls[0]).hostname}
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
