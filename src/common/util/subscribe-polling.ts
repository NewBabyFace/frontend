import type { menuai } from "../../types";

export const subscribePollingCollection = (
  menuai: menuai,
  updateData: (menuai: menuai) => void,
  interval: number
) => {
  let timeout;
  const fetchData = async () => {
    try {
      await updateData(menuai);
    } finally {
      timeout = setTimeout(() => fetchData(), interval);
    }
  };
  fetchData();
  return () => clearTimeout(timeout);
};
