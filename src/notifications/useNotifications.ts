import { useEffect } from "react";
import { connectNotifications } from "../services/notifications-service";

interface UseNotificationsOptions {
  accessToken: string | null | undefined;
  residentialComplexId: string | null | undefined;
}

export const useNotifications = ({
  accessToken,
  residentialComplexId,
}: UseNotificationsOptions): void => {
  useEffect(() => {
    if (!accessToken || !residentialComplexId) return;

    const socket = connectNotifications(accessToken);
    return () => {
      socket.disconnect();
    };
  }, [accessToken, residentialComplexId]);
};
