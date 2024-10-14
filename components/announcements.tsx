'use client'; // Client component

import { getAnnouncements } from '@/actions/announcement-actions';
import React, { useEffect, useState } from 'react';

interface Announcement {
  title: string;
  description: string;
  date: Date;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{announcements[0].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(
                  new Date(announcements[0].date)
                )}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[0].description}</p>
          </div>
        )}
        {announcements[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{announcements[1].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(
                  new Date(announcements[1].date)
                )}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[1].description}</p>
          </div>
        )}
        {announcements[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{announcements[2].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(
                  new Date(announcements[2].date)
                )}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
