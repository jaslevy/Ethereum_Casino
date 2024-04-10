import React from 'react';
import NavBar from '../components/NavBar';

function LeaderboardPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white-100 mt-3">
      <NavBar />
      <h2 className="text-2xl font-bold text-center mt-6 mb-3">LEADERBOARD</h2>
      <div className="mb-8">
        <div className="overflow-x-auto mt-5">
          <table className="table-auto w-full text-center whitespace-no-wrap">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Number of Wins</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {/* Mock data for demonstration */}
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0xab...1cd2</td>
                <td className="px-4 py-3 border">5</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0x3f...4a5b</td>
                <td className="px-4 py-3 border">3</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0xab...1cd2</td>
                <td className="px-4 py-3 border">5</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0x3f...4a5b</td>
                <td className="px-4 py-3 border">3</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0xab...1cd2</td>
                <td className="px-4 py-3 border">5</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0x3f...4a5b</td>
                <td className="px-4 py-3 border">3</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0xab...1cd2</td>
                <td className="px-4 py-3 border">5</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0x3f...4a5b</td>
                <td className="px-4 py-3 border">3</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0xab...1cd2</td>
                <td className="px-4 py-3 border">5</td>
              </tr>
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">0x3f...4a5b</td>
                <td className="px-4 py-3 border">3</td>
              </tr>
              {/* Add more rows as needed to fill the top 10 */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;