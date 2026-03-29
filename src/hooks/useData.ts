import { useEffect, useState } from 'react';

export function useData<T>(path: string): T[] {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + path)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [path]);

  return data;
}
