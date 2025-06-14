import { useEffect, useState } from 'react';
import { getLatestJobs } from 'services/userService';
import { JobLatest } from 'type';

export const useIncomingJob = () => {
  const [job, setJob] = useState<JobLatest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const latestJob = await getLatestJobs();
        if (!cancelled && latestJob) {
          setJob(latestJob);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch job');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, []); // runs once on mount

  return { job, loading, error };
};
